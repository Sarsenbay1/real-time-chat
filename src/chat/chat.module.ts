import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { UserModule } from 'src/user/user.module';
import { ChatGateway } from './chat-gateway';
import { ChatController } from './chat.controller';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [UserModule, RedisModule, TypeOrmModule.forFeature([Chat, Message])],
  providers: [ChatGateway, ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
