import { PrismaService } from '@app/common/prisma';
import { SocketManager } from '@app/components/websocket';
import { BadRequestException, Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { WsException } from '@nestjs/websockets';
import { NotificationType } from '@prisma/client';
import { getMessaging } from 'firebase-admin/messaging';
import * as _ from 'lodash';

import { DailyActions } from '../daily-actions.enum';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private socketManager: SocketManager,
    private schedulerRegistry: SchedulerRegistry
  ) {}

  async getAllNotifications(userId: number) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });

    if (!profile) {
      throw new BadRequestException('User has no profile');
    }

    const notifications = await this.prisma.notifications.findMany({
      where: { profileId: profile.id },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { notifications };
  }

  async sendNotification(
    profileId: number,
    message: string,
    notificationType: NotificationType,
    ctxProfileId: number
  ) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      select: { registrationToken: true },
    });

    if (!profile) {
      throw new WsException('Profile not found');
    }

    const ctxProfile = await this.prisma.profile.findUnique({
      where: { id: ctxProfileId },
      select: { userId: true, role: true },
    });

    if (!ctxProfile) {
      throw new WsException('Context profile not found');
    }

    const userInfo = await this.prisma.user.findUnique({
      where: { id: ctxProfile.userId },
      select: {
        name: true,
      },
    });

    if (!userInfo) {
      throw new WsException('User not found');
    }

    const firstProfilePhoto = await this.prisma.userPhoto.findFirst({
      where: {
        user: {
          id: ctxProfile.userId,
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    const notification = await this.prisma.notifications.create({
      data: {
        message,
        notificationType,
        profileId,
        ctxProfileId,
        ctxProfileName: userInfo.name,
        ctxProfilePhotoId: firstProfilePhoto?.id,
        ctxProfileType: ctxProfile.role,
      },
    });

    const recipientSocket =
      this.socketManager.getConnectionByProfileId(profileId);

    if (!recipientSocket) {
      if (!profile.registrationToken) {
        return;
      }

      const firebaseMessage = {
        notification: {
          title: 'New notification',
          body: message,
        },
        token: profile.registrationToken,
      };

      getMessaging()
        .send(firebaseMessage)
        .catch((error) => {
          console.error('Error sending message:', error);
        });

      return;
    }

    recipientSocket.emit('new-notification', {
      notification: {
        ...notification,
      },
    });
  }

  async cronSendNotification(profileId: number, dailyAction: DailyActions) {
    try {
      const isTimeoutExists = this.schedulerRegistry.getTimeout(
        `daily-limit-notification-${profileId}-action-${dailyAction}`
      );

      if (isTimeoutExists) {
        return;
      }
    } catch {
      // do nothing
      // if timeout not exists, getTimeout throws an error
      // so we catch it and do nothing
    }

    const message = `Your ${_.lowerCase(dailyAction)} limit was renewed`;

    const timeout = setTimeout(async () => {
      this.sendNotification(
        profileId,
        message,
        NotificationType.LIMIT_RENEW,
        profileId
      );
    }, 1000 * 60 * 60 * 24); // 24 hours in milliseconds

    this.schedulerRegistry.addTimeout(
      `daily-limit-notification-${profileId}-action-${dailyAction}`,
      timeout
    );
  }

  async deleteNotification(notificationId: number) {
    const readNotification = await this.prisma.notifications.findUnique({
      where: { id: notificationId },
      select: { id: true },
    });

    if (!readNotification) {
      throw new WsException('Notification not found');
    }

    await this.prisma.notifications.delete({
      where: { id: readNotification.id },
    });
  }
}
