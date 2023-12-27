import { IsEnum } from 'class-validator';

export enum SubscribeAction {
  LIKE = 'LIKE',
  MATCH = 'MATCH',
}

export class SubscribeActionReq {
  @IsEnum(SubscribeAction)
  actionType: SubscribeAction;
}
