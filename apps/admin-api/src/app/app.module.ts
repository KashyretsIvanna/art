import { SharedModule } from '@app/common/shared';
import { StripeModule } from '@app/common/stripe';
import { AdminModule } from '@app/components/admin';
import { AuthModule } from '@app/components/auth';
import { LimitsModule } from '@app/components/limits';
import { ProfileModule } from '@app/components/profile';
import { SubscriptionsModule } from '@app/components/subscriptions';
import { UserModule } from '@app/components/user';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { AdminController } from '../controllers/admin.controller';
import { AuthController } from '../controllers/auth.controller';
import { PaymentsController } from '../controllers/payments.controller';
import { ProjectSettingsController } from '../controllers/project-settings.controller';
import { SubscriptionsController } from '../controllers/subscriptions.controller';
import { UserController } from '../controllers/user.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SharedModule,
    AuthModule,
    UserModule,
    AdminModule,
    LimitsModule,
    SubscriptionsModule,
    StripeModule,
    ProfileModule,
  ],
  controllers: [
    AuthController,
    UserController,
    AdminController,
    ProjectSettingsController,
    SubscriptionsController,
    PaymentsController,
  ],
})
export class AppModule {}
