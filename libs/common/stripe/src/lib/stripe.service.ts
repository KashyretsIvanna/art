import { FullConfig } from '@app/common/configuration';
import { PrismaService } from '@app/common/prisma';
import { SubscriptionsService } from '@app/components/subscriptions';
import { UserService } from '@app/components/user';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripeSubscriptionStatus } from '@prisma/client';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService<FullConfig, true>,
    private prisma: PrismaService,
    private subscriptionService: SubscriptionsService,
    private userService: UserService
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-08-16',
      typescript: true,
    });
  }

  async createCustomerIfNotExists(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true, name: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    const customer = await this.createCustomer(user.email, user.name);

    await this.prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }

  async createCustomer(email: string, name: string) {
    return this.stripe.customers.create({
      email,
      name,
    });
  }

  async getPaymentMethods(userId: number) {
    const customerId = await this.createCustomerIfNotExists(userId);

    return this.stripe.paymentMethods.list({
      customer: customerId,
    });
  }

  async createSubscription(
    userId: number,
    priceId: string,
    paymentMethodId: string
  ) {
    const customerId = await this.createCustomerIfNotExists(userId);

    const applicationSettings =
      await this.prisma.applicationSettings.findFirst();

    if (!applicationSettings || !applicationSettings.premiumTrialDays) {
      throw new InternalServerErrorException('Application settings not found');
    }

    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isTrialUsed: true },
    });

    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      default_payment_method: paymentMethodId,
      payment_settings: {
        save_default_payment_method: 'on_subscription',
        payment_method_types: ['card'],
      },
      trial_period_days: user.isTrialUsed
        ? undefined
        : applicationSettings.premiumTrialDays,
    });

    const ephemeralKey = await this.stripe.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: '2023-08-16' }
    );

    await this.subscriptionService.createSubscription(userId, subscription.id);

    await this.prisma.user.update({
      where: { id: userId },
      data: { isTrialUsed: true },
    });

    return {
      customerId,
      ephemeralKey: ephemeralKey.secret,
      subscriptionId: subscription.id,
    };
  }

  async listSubscriptions(userId: number, priceId?: string) {
    const customerId = await this.createCustomerIfNotExists(userId);

    return this.stripe.subscriptions.list({
      customer: customerId,
      price: priceId,
    });
  }

  async cancelSubscription(userId: number) {
    const subscriptions = await this.listSubscriptions(userId);
    if (subscriptions.data.length === 0) {
      throw new BadRequestException('User does not have a subscription');
    }

    const subscription = subscriptions.data[0];

    return this.stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });
  }

  async constructEvent(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');

    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
  }

  async createEvent(id: string) {
    return this.prisma.stripeEvent.create({
      data: {
        stripeEventId: id,
      },
    });
  }

  async processSubscriptionUpdate(event: Stripe.Event) {
    try {
      await this.createEvent(event.id);
    } catch (error) {
      throw new BadRequestException(error);
    }
    const data = event.data.object as Stripe.Subscription;

    const customerId = data.customer as string;
    const subscriptionStatus = data.status as Stripe.Subscription.Status;

    const user = await this.prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (subscriptionStatus === 'active' || subscriptionStatus === 'trialing') {
      await this.subscriptionService.grantPremium(user.id, true);

      await this.subscriptionService.updateSubscription(
        data.id,
        StripeSubscriptionStatus.SUCCESSFUL
      );

      return;
    }

    if (subscriptionStatus === 'canceled' || subscriptionStatus === 'unpaid') {
      await this.subscriptionService.revokePremium(user.id, true);

      await this.subscriptionService.updateSubscription(
        data.id,
        StripeSubscriptionStatus.FAILED
      );

      return;
    }
  }

  async getPayments({
    limit,
    startAfter,
    endBefore,
    search,
  }: {
    limit: number;
    startAfter?: string;
    endBefore?: string;
    search?: string;
  }) {
    const user = await this.userService.getAllUsers({
      search,
      take: 1,
      page: 1,
      isSearchPayments: true,
    });

    if (!user.users[0]?.stripeCustomerId && search) {
      return { data: [] };
    }

    return this.stripe.paymentIntents.list({
      starting_after: startAfter,
      ending_before: endBefore,
      limit,
      customer: search ? user.users[0].stripeCustomerId : undefined,
      expand: ['data.customer', 'data.latest_charge'],
    });
  }

  async getPayment(paymentId: string) {
    return this.stripe.paymentIntents.retrieve(paymentId, {
      expand: ['customer', 'payment_method', 'latest_charge'],
    });
  }

  async refundPayment(paymentId: string, amount: number) {
    return this.stripe.refunds.create({
      payment_intent: paymentId,
      amount,
    });
  }
}
