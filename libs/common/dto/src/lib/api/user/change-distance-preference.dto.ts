import { IsNumber } from 'class-validator';

export class ChangeDistancePreferenceReq {
  @IsNumber()
  radius: number;
}
