import { IsNumber } from 'class-validator';

export class DeleteNotification {
  @IsNumber()
  notificationId: number;
}
