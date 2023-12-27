import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class FullClassificationDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  classificationName: string;
}
