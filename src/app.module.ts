import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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

@Module({
  imports: [
    ChatModule,
    AuthModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      validate: (rawConfig) => {
        const config = plainToInstance(EnvironmentVariables, rawConfig, {
          enableImplicitConversion: true,
        });

        const errors = validateSync(config);
        if (errors.length > 0) {
          throw new Error(errors.toString());
        }
        return config;
      },
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
  ],

  controllers: [AppController],
  providers: [AppService],
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
