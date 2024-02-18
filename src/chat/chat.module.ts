import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
// import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { ChatController } from './chat.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([Chat, Message])],
  // providers: [ChatGateway, ChatService],
  providers: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
