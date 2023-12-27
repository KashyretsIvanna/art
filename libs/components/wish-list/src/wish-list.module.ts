import { Module } from '@nestjs/common';

import { WishListService } from './wish-list.service';

@Module({
  controllers: [],
  providers: [WishListService],
  exports: [WishListService],
})
export class WishListModule {}
