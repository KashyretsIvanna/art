import { EmailNotificationsRecieveType } from '@prisma/client';
import { IsIn } from 'class-validator';

export class ChangeEmailNotificationsRecieveTypeReq {
  @IsIn(Object.values(EmailNotificationsRecieveType))
  recieveType: EmailNotificationsRecieveType;
}
