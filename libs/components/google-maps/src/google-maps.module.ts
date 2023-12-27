import { Module } from '@nestjs/common';

import { GoogleMapsService } from './google-maps.service';

@Module({
  controllers: [],
  providers: [GoogleMapsService],
  exports: [GoogleMapsService],
})
export class GoogleMapsModule {}
