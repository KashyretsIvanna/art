import {
  PaginationReq,
  ProfileIdReq,
  ShortProfilePaginatedRes,
  UserReq,
} from '@app/common/dto';
import { ProfileAccessComposition, ReqUser } from '@app/common/shared';
import { FavoritesService } from '@app/components/favorites';
import { ProfileService } from '@app/components/profile';
import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Favorites } from '@prisma/client';

@Controller('favorites')
@ApiTags('favorites')
@ProfileAccessComposition()
export class FavoritesController {
  constructor(
    private favoritesService: FavoritesService,
    private profileService: ProfileService
  ) {}

  @ApiOperation({ summary: 'Add to favorites by profile id' })
  @Post('change')
  favorite(
    @Body() { profileId }: ProfileIdReq,
    @ReqUser() user: UserReq
  ): Promise<Favorites> {
    if (user.profile.id === profileId) {
      throw new BadRequestException('You can not add to favorite yourself');
    }

    return this.favoritesService.favorite(user, profileId);
  }

  @ApiOperation({ summary: 'Get my favorites' })
  @Post()
  getMyFavorites(
    @ReqUser() user: UserReq,
    @Body() body: PaginationReq
  ): Promise<ShortProfilePaginatedRes> {
    return this.profileService.getFavoriteProfiles(user, body);
  }
}
