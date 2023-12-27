import {
  FullLikesDto,
  FullRewindDto,
  FullSuperLikesDto,
  FullUnLikesDto,
  ProfileIdReq,
  RewindReq,
  UserReq,
} from '@app/common/dto';
import { ProfileAccessComposition, ReqUser } from '@app/common/shared';
import { LikesService } from '@app/components/likes';
import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('likes')
@ApiTags('likes')
@ProfileAccessComposition()
export class LikesController {
  constructor(private likesService: LikesService) {}

  @ApiOperation({ summary: 'Like user by profile id' })
  @Post()
  likeProfile(
    @ReqUser() user: UserReq,
    @Body() { profileId }: ProfileIdReq
  ): Promise<FullLikesDto> {
    if (user.profile.id === profileId) {
      throw new BadRequestException('You  can not like yourself');
    }

    return this.likesService.likeUser(profileId, user);
  }

  @ApiOperation({ summary: 'Super like user by profile id' })
  @Post('/super')
  superLikeProfile(
    @ReqUser() user: UserReq,
    @Body() { profileId }: ProfileIdReq
  ): Promise<FullSuperLikesDto> {
    if (user.profile.id === profileId) {
      throw new BadRequestException('You  can not super like yourself');
    }

    if (!user.isPremium) {
      throw new BadRequestException(
        'User with standard account is not able to superLike'
      );
    }

    return this.likesService.superLike(profileId, user);
  }

  @ApiOperation({ summary: 'Un like user by profile id' })
  @Post('/unLike')
  unLikeProfile(
    @ReqUser() user: UserReq,
    @Body() { profileId }: ProfileIdReq
  ): Promise<FullUnLikesDto> {
    if (user.profile.id === profileId) {
      throw new BadRequestException('You  can not unLike yourself');
    }

    return this.likesService.createUnlike(user, profileId);
  }

  @ApiOperation({ summary: 'Rewind user by profile id' })
  @Post('/rewind')
  rewind(
    @ReqUser() user: UserReq,
    @Body() { profileId }: RewindReq
  ): Promise<FullRewindDto> {
    if (user.profile.id === profileId) {
      throw new BadRequestException('You can not rewind yourself');
    }

    return this.likesService.rewind(profileId, user);
  }
}
