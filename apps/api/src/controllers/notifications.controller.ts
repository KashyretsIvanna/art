import { GetAllNotificationsRes } from '@app/common/dto';
import { AccessComposition, ReqUser } from '@app/common/shared';
import { NotificationsService } from '@app/components/notifications';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';

@Controller('notifications')
@ApiTags('notifications')
@AccessComposition()
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get('/')
  getAllNotifications(@ReqUser() { id }: User) {
    return this.notificationsService.getAllNotifications(id);
  }
}
