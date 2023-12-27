import { FullConfig } from '@app/common/configuration';
import { PrismaService } from '@app/common/prisma';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio/lib';

@Injectable()
export class SmsService {
  private twilioClient: Twilio;
  private serviceSid: string;

  constructor(
    private configService: ConfigService<FullConfig, true>,
    private prisma: PrismaService
  ) {
    const accountSid = configService.get('TWILIO_ACCOUNT_SID');
    const authToken = configService.get('TWILIO_AUTH_TOKEN');

    this.twilioClient = new Twilio(accountSid, authToken);
    this.serviceSid = this.configService.get('TWILIO_SERVICE_SID');
  }

  async initiatePhoneVerification(id: number, phoneNumber: string) {
    const isNumberVerified = (
      await this.prisma.user.findMany({
        where: { phoneNumber, isPhoneVerified: true },
      })
    )[0];

    if (isNumberVerified) {
      throw new BadRequestException('This number is already registered!');
    }

    await this.prisma.user.update({
      where: { id },
      data: { phoneNumber, isPhoneVerified: false },
    });

    return this.twilioClient.verify.v2
      .services(this.serviceSid)
      .verifications.create({ to: phoneNumber, channel: 'sms' });
  }

  async verifyPhoneNumber(
    id: number,
    phoneNumber: string,
    verificationCode: string
  ) {
    const result = (await this.twilioClient.verify.v2
      .services(this.serviceSid)
      .verificationChecks.create({
        to: phoneNumber,
        code: verificationCode,
      })) as { valid: boolean; status: string };

    if (!result.valid || result.status !== 'approved') {
      throw new BadRequestException('Wrong code provided');
    }

    await this.prisma.user.update({
      where: { id },
      data: { isPhoneVerified: true },
    });
  }
}
