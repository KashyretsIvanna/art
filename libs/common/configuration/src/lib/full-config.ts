import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class FullConfig {
  /**
   * Fundamental environment variable.
   * It should not be defined in any config files.
   *
   * It should be defined from cli or npm script according
   * to NX documentation.
   *
   * But it may be shared to some config file... (think about it :D)
   * (For example into Dockerfile)
   *
   * Is not the same with RUN_MODE!
   * (see description below)
   */
  NODE_ENV: 'development' | 'production' | 'test';

  /**
   *  * RUN_MODE = 'development' | 'production' => NODE_ENV = 'production'
   *      because it means that this is real application's
   *      run (even if development)... so code should not require watch
   *      features or etc. dev helpers. Instead it should be minimized for
   *      server and fasted as possible
   *
   *  * RUN_MODE = 'test' => NODE_ENV = 'test'
   *
   *  * RUN_MODE is not defined => NODE_ENV = 'development'
   *      because it means that this is local development process
   */
  @IsString()
  @IsOptional()
  RUN_MODE: 'development' | 'production' | 'test';

  /**
   * This timezone
   * (often you should difference between code and db)
   * this is simple solution how configure it on your side
   */
  @IsString()
  TZ = 'GMT';

  @Transform(({ value }) => +value)
  @IsInt()
  @Min(3000)
  @Max(9999)
  API_PORT: number;

  @IsEmail()
  MAILER_USER: string;

  @IsString()
  MAILER_PASS: string;

  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  FACEBOOK_CLIENT_ID: string;

  @IsString()
  FACEBOOK_CLIENT_SECRET: string;

  @IsString()
  TWILIO_ACCOUNT_SID: string;

  @IsString()
  TWILIO_AUTH_TOKEN: string;

  @IsString()
  TWILIO_SERVICE_SID: string;

  @IsString()
  FIREBASE_PROJECT_ID: string;

  @IsString()
  FIREBASE_PRIVATE_KEY: string;

  @IsString()
  GOOGLE_CLOUD_API_KEY: string;

  @IsString()
  FIREBASE_CLIENT_EMAIL: string;

  @IsString()
  FIREBASE_STORAGE_BUCKET: string;

  @IsString()
  AIR_TABLE_BASE_ID: string;

  @IsString()
  AIR_TABLE_TABLE_NAME: string;

  @IsString()
  AIR_TABLE_ACCESS_TOKEN: string;

  @IsString()
  ADMIN_PORT: string;

  @IsString()
  STRIPE_SECRET_KEY: string;

  @IsString()
  STRIPE_CURRENCY: string;

  @IsString()
  STRIPE_WEBHOOK_SECRET: string;
}
