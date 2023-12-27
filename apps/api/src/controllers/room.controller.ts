import { CreateRoomRes, ProfileRoomsRes, UserReq } from '@app/common/dto';
import { ProfileAccessComposition, ReqUser } from '@app/common/shared';
import { ChatService } from '@app/components/chat';
import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('room')
@ApiTags('room')
@ProfileAccessComposition()
export class RoomController {
  constructor(private chatService: ChatService) {}

  @Post('/:memberId')
  async createRoom(
    @ReqUser() user: UserReq,
    @Param('memberId') memberId: number
  ): Promise<CreateRoomRes> {
    const chat = await this.chatService.createRoom(user, memberId);

    return chat;
  }

  @Get()
  getProfileRooms(@ReqUser() user: UserReq): Promise<ProfileRoomsRes> {
    return this.chatService.getProfileRooms(user.profile.id);
  }

  @Delete('/:roomId')
  deleteRoom(@ReqUser() { id }: UserReq, @Param('roomId') roomId: number) {
    return this.chatService.deleteRoom(roomId, id);
  }
}
