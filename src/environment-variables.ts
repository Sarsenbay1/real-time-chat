import { IsInt, IsString } from 'class-validator';

export class EnvironmentVariables {
  @IsInt()
  PORT: number;

  @IsInt()
  POSTGRES_PORT: number;

  @IsString()
  POSTGRES_HOST: string;

  @IsString()
  POSTGRES_PASSWORD: string;

  @IsString()
  POSTGRES_DB: string;

  @IsString()
  POSTGRES_USER: string;

  @IsString()
  JWT_SECRET: string;
}
