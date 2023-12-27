import { DataFromCordsRes } from '@app/common/dto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import urlcat from 'urlcat';

enum GoogleMapsEndpoints {
  DATA_BY_COORDS = `https://maps.googleapis.com/maps/api/geocode/json`,
}

@Injectable()
export class GoogleMapsService {
  constructor(private configService: ConfigService) {}

  async getLocationFromCoords(lat: number, lng: number) {

    return {city:'Kyiv', country:'Ukraine'}
    const api_key = this.configService.get('GOOGLE_CLOUD_API_KEY');

    const url = urlcat(GoogleMapsEndpoints.DATA_BY_COORDS, {
      latlng: `${lat},${lng}`,
      key: api_key,
    });

    const locationData: AxiosResponse<DataFromCordsRes> = await axios.get(url);

    if (locationData.data.status !== 'OK') {
      throw new InternalServerErrorException(
        `Internal server error trying to get location by coordinates ${locationData.data.status}`
      );
    }
    let city = null;
    let country = null;

    for (const result of locationData.data.results) {
      for (const component of result.address_components) {
        const { types, long_name } = component;

        if (types.includes('locality')) {
          city = long_name;
          break; // Exit the loop once city is found
        } else if (types.includes('country')) {
          country = long_name;
          break; // Exit the loop once country is found
        }
      }
      if (city && country) {
        break;
      }
    }

    return city && country ? { city, country } : null;
  }
}
