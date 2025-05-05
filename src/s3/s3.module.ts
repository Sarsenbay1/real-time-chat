import { S3Client } from '@aws-sdk/client-s3';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'S3_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new S3Client({
          endpoint: configService.get<string>('MINIO_ENDPOINT'),
          credentials: {
            accessKeyId: configService.get<string>('MINIO_ACCESS_KEY'),
            secretAccessKey: configService.get<string>('MINIO_SECRET_KEY'),
          },
          region: configService.get<string>('S3_REGION') || 'europe',
          forcePathStyle: true,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['S3_CLIENT'],
})
export class S3Module {}
