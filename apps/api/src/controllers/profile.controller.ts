import {
  ChangePhotoOrderReq,
  EditProfileReq,
  IdRes,
  PaginatedProfileDiscoveryRes,
  PaginationReq,
  ProfileLookingForReq,
  ProfileReq,
  ProfileRes,
  UploadProfilePhotoRes,
  ShortProfilePaginatedRes,
  UserProfileByIdRes,
  UserReq,
  ShortProfilePhotoPhotoRes,
  ReplaceProfilePhotoReq,
} from '@app/common/dto';
import {
  ImagesInterceptor,
  ProfileAccessComposition,
  ProfileNotRequired,
  ReqUser,
} from '@app/common/shared';
import { GoogleMapsService } from '@app/components/google-maps';
import { ProfileService } from '@app/components/profile';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User, UserRole } from '@prisma/client';

@Controller('profile')
@ApiTags('profile')
@ProfileAccessComposition()
export class ProfileController {
  constructor(
    private profileService: ProfileService,
    private googleMapsService: GoogleMapsService
  ) {}

  @ProfileNotRequired()
  @ApiOperation({ summary: 'Create profile by role' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Profile already exists',
  })
  @Post()
  async createProfile(
    @Body() body: ProfileReq,
    @ReqUser() user: UserReq
  ): Promise<IdRes> {
    let response: IdRes;

    if (user.profile) {
      throw new BadRequestException('Profile already exists');
    }

    const userPhotos = await this.profileService.getUserPhotos(user.id);

    if (!userPhotos.length) {
      throw new BadRequestException('Firstly provide photos');
    }

    const {
      orientations,
      classifications,
      galleryTypes,
      role,
      ...commonProfileData
    } = body;

    const locationData = await this.googleMapsService.getLocationFromCoords(
      commonProfileData.location.lat,
      commonProfileData.location.lng
    );

    switch (role) {
      case UserRole.GALLERY:
        response = await this.profileService.createGallery(
          {
            ...commonProfileData,
            classifications,
            orientations,
            galleryTypes,
            ...locationData,
          },
          user
        );
        break;
      case UserRole.ARTIST:
        response = await this.profileService.createArtist(
          { ...commonProfileData, classifications, ...locationData },
          user
        );
        break;
      case UserRole.COLLECTOR:
        response = await this.profileService.createCollector(
          { ...commonProfileData, ...locationData },
          user
        );
        break;
    }

    return response;
  }

  @ApiOperation({ summary: 'Set looking for and filters' })
  @Put('looking-for')
  async lookingFor(
    @Body() body: ProfileLookingForReq,
    @ReqUser() user: UserReq
  ) {
    return this.profileService.setLookingFor(body, user);
  }

  @ApiOperation({ summary: 'Get looking for and filters' })
  @Get('looking-for')
  async getLookingFor(@ReqUser() user: UserReq): Promise<ProfileLookingForReq> {
    return this.profileService.getLookingFor(user);
  }

  @ApiOperation({ summary: 'Edit profile' })
  @Patch()
  async editProfile(@Body() body: EditProfileReq, @ReqUser() user: UserReq) {
    return this.profileService.editProfile(user, body);
  }

  @ApiOperation({ summary: 'Get discovery profiles' })
  @Post('discovery')
  async getDiscoveryAccount(
    @ReqUser() user: UserReq,
    @Body() body: PaginationReq
  ): Promise<PaginatedProfileDiscoveryRes> {
    return this.profileService.getProfiles(user, {
      skip: (body.page - 1) * body.limit,
      limit: body.limit,
    });
  }

  @ApiOperation({ summary: 'Get all profile information' })
  @Get()
  async getProfileInformation(@ReqUser() user: UserReq): Promise<ProfileRes> {
    return this.profileService.getMyProfile(user);
  }

  @ApiOperation({ summary: 'Get full profile by id' })
  @Get(':id')
  async getProfileById(
    @ReqUser() user: UserReq,
    @Param('id') profileId: number
  ): Promise<UserProfileByIdRes> {
    return this.profileService.getProfileById(user, profileId);
  }

  @ApiOperation({ summary: 'Get top picks' })
  @Get('/top/picks')
  getTopPicks(@ReqUser() user: UserReq): Promise<ShortProfilePhotoPhotoRes[]> {
    return this.profileService.getTopProfiles(user);
  }

  @ApiOperation({ summary: 'UnMatched profiles' })
  @Post('/un-matches')
  async unMatches(
    @ReqUser() user: UserReq,
    @Body() body: PaginationReq
  ): Promise<ShortProfilePaginatedRes> {
    return this.profileService.getUnMatchedProfiles(user, body);
  }

  @ApiOperation({ summary: 'Matched profiles' })
  @Post('/matches')
  async matches(
    @ReqUser() user: UserReq,
    @Body() body: PaginationReq
  ): Promise<ShortProfilePaginatedRes> {
    return this.profileService.getMatchedProfiles(user, body);
  }

  @ApiOperation({ summary: 'Get profiles that liked me' })
  @Post('/new-likes')
  newLikes(
    @ReqUser() user: UserReq,
    @Body() body: PaginationReq
  ): Promise<ShortProfilePaginatedRes> {
    return this.profileService.getNewLikes(user, body);
  }

  @ProfileNotRequired()
  @Post('photo')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        order: { type: 'integer' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    ImagesInterceptor({
      fieldName: 'photo',
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.includes('image')) {
          return callback(
            new BadRequestException('All files must be images'),
            false
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: Math.pow(1024, 2) * 5, // 5MB
      },
    })
  )
  uploadProfilePhoto(
    @UploadedFiles() file: Express.Multer.File[],
    @ReqUser() { id }: User
  ): Promise<UploadProfilePhotoRes> {
    return this.profileService.uploadProfilePhoto(id, file[0]);
  }

  @ProfileNotRequired()
  @Post('photo/replace')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        order: { type: 'integer' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    ImagesInterceptor({
      fieldName: 'photo',
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.includes('image')) {
          return callback(
            new BadRequestException('All files must be images'),
            false
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: Math.pow(1024, 2) * 5, // 5MB
      },
    })
  )
  replaceProfilePhoto(
    @UploadedFiles() file: Express.Multer.File[],
    @Body() { order }: ReplaceProfilePhotoReq,
    @ReqUser() { id }: User
  ) {
    return this.profileService.replaceProfilePhoto(id, file[0], order);
  }

  @Post('avatar')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    ImagesInterceptor({
      fieldName: 'photo',
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.includes('image')) {
          return callback(
            new BadRequestException('All files must be images'),
            false
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: Math.pow(1024, 2) * 5, // 5MB
      },
    })
  )
  uploadAvatar(
    @UploadedFiles() file: Express.Multer.File[],
    @ReqUser() { id }: User
  ) {
    return this.profileService.uploadAvatar(id, file[0]);
  }

  @Delete('photo/:id')
  deleteProfilePhoto(@Param('id') fileId: number, @ReqUser() { id }: User) {
    return this.profileService.deleteProfilePhoto(fileId, id);
  }

  @Patch('photo/order')
  changePhotoOrder(@Body() { orderedIds }: ChangePhotoOrderReq) {
    return this.profileService.changePhotoOrder(orderedIds);
  }

  @ProfileNotRequired()
  @Get('/plan/premium')
  switchPremium(@ReqUser() { id }: User) {
    return this.profileService.switchPremium(id);
  }

  @Post('/tutorial')
  async markTutorialAsShown(@ReqUser() { id }: User) {
    return this.profileService.markTutorialAsShown(id);
  }
}
