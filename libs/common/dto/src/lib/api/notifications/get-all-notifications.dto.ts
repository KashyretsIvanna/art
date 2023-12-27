import { Notifications } from '@prisma/client';

export class GetAllNotificationsRes {
  notifications: Notifications[];
}
