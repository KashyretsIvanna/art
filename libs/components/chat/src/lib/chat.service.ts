import { FullConfig } from '@app/common/configuration';
import { CreateMessageReq, UserReq } from '@app/common/dto';
import { PrismaService } from '@app/common/prisma';
import { FilesService } from '@app/components/files';
import { LikesService } from '@app/components/likes';
import { NotificationsService } from '@app/components/notifications';
import { SocketManager } from '@app/components/websocket';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { NotificationType, PlanName } from '@prisma/client';
import { Socket } from 'socket.io';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService<FullConfig, true>,
    private jwtService: JwtService,
    private likesService: LikesService,
    private filesService: FilesService,
    private socketManager: SocketManager,
    private notificationsService: NotificationsService
  ) {}

  async createRoom(user: UserReq, profileId: number) {
    const anotherMember = await this.prisma.profile.findUnique({
      where: { id: profileId },
      select: {
        userId: true,
      },
    });

    const existedRoom = await this.getRoomByMembers(user.profile.id, profileId);
    if (existedRoom.roomId) {
      return {
        data: {
          id: existedRoom.roomId,
        },
      };
    }

    if (!anotherMember) {
      throw new BadRequestException('User not found');
    }

    if (user.id === anotherMember.userId) {
      throw new BadRequestException('Provide different users');
    }

    const plan = await this.prisma.userSubscription.findUnique({
      where: { userId: user.id },
      select: {
        plan: {
          select: {
            planName: true,
          },
        },
      },
    });

    if (!plan) {
      throw new BadRequestException('No plan chosen');
    }

    if (plan.plan.planName === PlanName.PREMIUM) {
      const newRoom = await this.prisma.room.create({
        data: {},
      });

      await this.prisma.membersOnRooms.create({
        data: {
          memberId: [user.profile.id, profileId],
          roomId: newRoom.id,
        },
      });

      return {
        data: {
          id: newRoom.id,
        },
      };
    }

    const match = await this.likesService.getMatches({
      user,
      likedUserProfileId: profileId,
    });

    if (!match.data[0]) {
      throw new BadRequestException('You have no match with this profile');
    }

    const newRoom = await this.prisma.room.create({
      data: {},
    });

    await this.prisma.membersOnRooms.create({
      data: {
        memberId: [user.profile.id, profileId],
        roomId: newRoom.id,
      },
    });

    return {
      data: {
        id: newRoom.id,
      },
    };
  }

  async deleteRoom(roomId: number, userId: number) {
    const roomToDelete = await this.prisma.membersOnRooms.findUnique({
      where: { roomId },
    });

    if (!roomToDelete) {
      throw new NotFoundException('Room not found');
    }

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: {
        id: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!profile) {
      throw new BadRequestException('User has no profile');
    }

    if (!roomToDelete.memberId.includes(profile.id)) {
      throw new ForbiddenException('User is not a member of this room');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.membersOnRooms.delete({ where: { roomId } });
      await tx.room.delete({ where: { id: roomId } });
    });

    const anotherMemberProfileId = roomToDelete.memberId.filter(
      (memberId) => memberId != profile.id
    )[0];

    const anotherMemberProfile = await this.prisma.profile.findUnique({
      where: { id: anotherMemberProfileId },
    });

    if (anotherMemberProfile) {
      await this.notificationsService.sendNotification(
        anotherMemberProfileId,
        `${profile.user.name} deleted chat with you`,
        NotificationType.CHAT_DELETED,
        profile.id
      );
    }
  }

  async getRoomByMembers(firstMemberId: number, secondMemberId: number) {
    const members = await this.prisma.membersOnRooms.findFirst({
      where: {
        AND: [
          {
            memberId: { has: firstMemberId },
          },
          { memberId: { has: secondMemberId } },
        ],
      },
      select: { roomId: true },
    });

    return { roomId: members ? members.roomId : null };
  }

  async getProfileRooms(profileId: number) {
    const profileRooms = await this.prisma.membersOnRooms.findMany({
      where: { memberId: { has: profileId } },
    });

    const res = await Promise.all(
      profileRooms.map(async (profileRoom) => {
        const anotherMemberId = profileRoom.memberId.filter(
          (memberId) => memberId != profileId
        )[0];

        const lastMessage = (
          await this.prisma.message.findMany({
            where: { roomId: profileRoom.roomId },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              content: true,
              attachmentId: true,
              authorId: true,
              createdAt: true,
            },
          })
        )[0];

        const noOfUnread = await this.prisma.message.count({
          where: {
            roomId: profileRoom.roomId,
            isRead: false,
            authorId: anotherMemberId,
          },
        });

        return {
          roomId: profileRoom.roomId,
          profileId: anotherMemberId,
          lastMessage,
          noOfUnread,
        };
      })
    );

    res.sort((r1, r2) => {
      const d1 = r1.lastMessage?.createdAt || new Date(8640000000000000);
      const d2 = r2.lastMessage?.createdAt || new Date(8640000000000000);

      if (d1 > d2) {
        return -1;
      } else if (d1 < d2) {
        return 1;
      }

      return 0;
    });

    return { rooms: res };
  }

  async findUserByToken(accessToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(accessToken, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });

      return this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { profile: true },
      });
    } catch (err) {
      throw new WsException(err as Error);
    }
  }

  async createMessage(createMessageData: CreateMessageReq, client: Socket) {
    const authorId = this.socketManager.getProfileIdBySocket(client);

    if (!authorId) {
      throw new WsException('Unexpected server error');
    }

    const room = await this.prisma.room.findUnique({
      where: { id: createMessageData.roomId },
      select: {
        members: {
          select: {
            memberId: true,
          },
        },
      },
    });

    if (!room) {
      throw new WsException('No room with provided id');
    }

    if (!room.members) {
      throw new WsException('No members in this room');
    }

    const isProfileInRoom = room.members.memberId.filter(
      (member) => member === authorId
    )[0];

    if (!isProfileInRoom) {
      throw new WsException("Profile isn't a member of this room");
    }

    const message = await this.saveMessageToDb(createMessageData, authorId);

    client.emit('new-message', message);

    const recipientId = room.members.memberId.filter(
      (member) => member !== authorId
    )[0];

    const recipientSocket =
      this.socketManager.getConnectionByProfileId(recipientId);

    if (recipientSocket) {
      recipientSocket.emit('new-message', message);
    }

    const author = await this.prisma.profile.findUnique({
      where: { id: authorId },
      select: { user: { select: { name: true } } },
    });

    await this.notificationsService.sendNotification(
      recipientId,
      `You have a new message from ${author!.user.name}`,
      NotificationType.NEW_MESSAGE,
      authorId
    );
  }

  async saveMessageToDb(createMessageData: CreateMessageReq, authorId: number) {
    if (createMessageData.attachment) {
      const [meta, base64Data] = createMessageData.attachment.split(',');
      const contents = Buffer.from(base64Data, 'base64');

      const mimetype = meta.split(';')[0].split(':')[1]; // omg

      const attachment = await this.filesService.uploadMessageAttachment({
        mimetype,
        contents,
      });

      return this.prisma.message.create({
        data: {
          content: createMessageData.content,
          authorId: authorId,
          roomId: createMessageData.roomId,
          attachmentId: attachment.id,
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          authorId: true,
          attachmentId: true,
          roomId: true,
        },
      });
    } else {
      return this.prisma.message.create({
        data: {
          content: createMessageData.content,
          authorId: authorId,
          roomId: createMessageData.roomId,
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          authorId: true,
          roomId: true,
        },
      });
    }
  }

  async getRoomMessages(
    roomId: number,
    client: Socket,
    page: number,
    take: number
  ) {
    const profileId = this.socketManager.getProfileIdBySocket(client);

    if (!profileId) {
      throw new WsException('Unexpected server error');
    }

    const room = await this.prisma.membersOnRooms.findUnique({
      where: { roomId },
    });

    if (!room) {
      throw new WsException('Room not found');
    }

    const isProfileInRoom = room.memberId.includes(profileId);

    if (!isProfileInRoom) {
      throw new WsException("User isn't a member of this room");
    }

    const messages = await this.prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * take,
      take,
    });

    const totalMessages = await this.prisma.message.count({
      where: { roomId },
    });

    client.emit('room-messages', {
      data: messages,
      pages: Math.ceil(totalMessages / take),
    });
  }

  async markMessageAsRead(messageId: number) {
    const readMessage = await this.prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
      select: { id: true, authorId: true, roomId: true },
    });

    if (!readMessage) {
      throw new WsException('Message not found');
    }

    const room = await this.prisma.room.findUnique({
      where: { id: readMessage.roomId },
      select: { members: true },
    });

    if (!room) {
      throw new WsException('Unexpected server error');
    }

    const recipientSocket = this.socketManager.getConnectionByProfileId(
      readMessage.authorId
    );

    if (recipientSocket) {
      recipientSocket.emit('read-message', {
        messageId,
        roomId: readMessage.roomId,
      });
    }
  }
}
