import { Injectable, Inject } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  constructor(
    @Inject('S3_CLIENT') private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
  ) {}

  async uploadFile(file, fileName?: string) {
    const params = {
      Bucket: this.configService.get<string>('MINIO_BUCKET_NAME'),
      Key: fileName || file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    return this.s3Client.send(new PutObjectCommand(params));
  }
}
