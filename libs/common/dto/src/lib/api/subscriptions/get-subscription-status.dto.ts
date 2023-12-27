import { StripeSubscriptionStatus } from '@prisma/client';

export class GetSubscriptionStatusRes {
  subscriptionStatus: StripeSubscriptionStatus;
}
