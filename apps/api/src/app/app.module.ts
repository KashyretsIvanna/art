import { SharedModule } from '@app/common/shared';
import { StripeModule } from '@app/common/stripe';
import { ArtClassificationsModule } from '@app/components/art-classifications';
import { ArtOrientationsModule } from '@app/components/art-orientations';
import { AuthModule } from '@app/components/auth';
import { BoostModule } from '@app/components/boost';
import { ChatModule } from '@app/components/chat';
import { FavoritesModule } from '@app/components/favorites';
import { FilesModule } from '@app/components/files';
import { GalleryTypesModule } from '@app/components/gallery-types';
import { GoogleMapsModule } from '@app/components/google-maps';
import { LikesModule } from '@app/components/likes';
import { LimitsModule } from '@app/components/limits';
import { NotificationsModule } from '@app/components/notifications';
import { PresenceModule } from '@app/components/presence';
import { ProfileModule } from '@app/components/profile';
import { SubscriptionsModule } from '@app/components/subscriptions';
import { UserModule } from '@app/components/user';
import { WebsocketModule } from '@app/components/websocket';
import { WishListModule } from '@app/components/wish-list';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { ArtClassificationsController } from '../controllers/art-classifications.controller';
import { ArtOrientationsController } from '../controllers/art-orientations.controller';
import { AuthController } from '../controllers/auth.controller';
import { BoostController } from '../controllers/boost.controller';
import { FavoritesController } from '../controllers/favorites.controller';
import { FilesController } from '../controllers/files.controller';
import { GalleryTypesController } from '../controllers/gallery-types.controller';
import { LikesController } from '../controllers/likes.controller';
import { NotificationsController } from '../controllers/notifications.controller';
import { ProfileController } from '../controllers/profile.controller';
import { RoomController } from '../controllers/room.controller';
import { SettingsController } from '../controllers/settings.controller';
import { StripeController } from '../controllers/stripe.controller';
import { SubscriptionsController } from '../controllers/subscriptions.controller';
import { UserController } from '../controllers/user.controller';
import { WishListController } from '../controllers/wish-list.controller';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    ProfileModule,
    FavoritesModule,
    ArtClassificationsModule,
    ArtOrientationsModule,
    GalleryTypesModule,
    UserModule,
    LikesModule,
    ChatModule,
    LimitsModule,
    FilesModule,
    LikesModule,
    BoostModule,
    WishListModule,
    PresenceModule,
    WebsocketModule,
    GoogleMapsModule,
    NotificationsModule,
    StripeModule,
    ScheduleModule.forRoot(),
    SubscriptionsModule,
  ],

  controllers: [
    AuthController,
    ProfileController,
    ArtOrientationsController,
    ArtClassificationsController,
    GalleryTypesController,
    UserController,
    SettingsController,
    LikesController,
    FilesController,
    BoostController,
    RoomController,
    FavoritesController,
    WishListController,
    NotificationsController,
    StripeController,
    SubscriptionsController,
  ],
})
export class AppModule {}
