import { ConfigService } from '@nestjs/config';
import { Chat } from 'src/chat/entities/chat.entity';
import { Message } from 'src/chat/entities/message.entity';
import { EnvironmentVariables } from 'src/environment-variables';
import { User } from 'src/user/entities/user.entity';

export const database = async (
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
});
