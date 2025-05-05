import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './user/entities/user.entity';
import { Chat } from './chat/entities/chat.entity';
import { Message } from './chat/entities/message.entity';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { plainToInstance } from 'class-transformer';
import { EnvironmentVariables } from './environment-variables';
import { validateSync } from 'class-validator';
import { RedisModule } from './redis/redis.module';
import { validate } from './common/validate';
import { S3Module } from './s3/s3.module';

@Module({
  imports: [
    ChatModule,
    AuthModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      validate: validate, //there's differences
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USER'),
        database: configService.get<string>('POSTGRES_DB'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        entities: [User, Chat, Message],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UserModule,
    ChatModule,
    S3Module,
  ],

  providers: [RedisModule],
})
export class AppModule {
  constructor(
    private configService: ConfigService<EnvironmentVariables, true>,
  ) {
    console.log(
      `DB work to PORT ${configService.get<number>('POSTGRES_PORT')}`,
    );
  }
}
