import { PlanName } from '@prisma/client';

export class GetCurrentSubscriptionRes {
  endDate: Date;
  wasPaid: boolean;
  plan: {
    planName: PlanName;
  };
}
