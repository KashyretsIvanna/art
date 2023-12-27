import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

import { accountDeletionTemplate } from './templates/account-deletion.template';
import { emailVerificationTemplate } from './templates/email-verification.template';
import { premiumExpiredTemplate } from './templates/expired-premium.template';
import { giftedPremiumTemplate } from './templates/gifted-premium.template';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendEmailVerificationCode(email: string, code: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Email Verification Code',
      html: emailVerificationTemplate(code),
    });
  }

  async sendGiftPremiumMail(name: string, date: Date, email: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Gifted Premium',
      html: giftedPremiumTemplate(name, date),
    });
  }

  async sendExpirePremiumMail(name: string, email: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Premium expired!',
      html: premiumExpiredTemplate(name),
    });
  }

  async sendResetPasswordCode(email: string, code: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset Password Code',
      text: `Reset password code: ${code}`,
    });
  }

  async sendAccountDeleted(email: string, name: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Account Deleted',
      html: accountDeletionTemplate(name),
    });
  }
}
