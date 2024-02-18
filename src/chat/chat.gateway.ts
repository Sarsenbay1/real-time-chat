// import {
//   WebSocketGateway,
//   SubscribeMessage,
//   MessageBody,
// } from '@nestjs/websockets';
// import { ChatService } from './chat.service';
// import { CreateChatDto } from './dto/create-chat.dto';
// import { UpdateChatDto } from './dto/update-chat.dto';
// import { Controller } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Chat } from './entities/chat.entity';
// @Controller('chat')
// @WebSocketGateway()
// export class ChatGateway {
//   constructor(
//     private readonly chatService: ChatService,
//     @InjectRepository(Chat)
//     chatRepository: Repository<Chat>,
//   ) {}

//   @SubscribeMessage('createChat')
//   create(@MessageBody() createChatDto: CreateChatDto) {
//     return this.chatService.createChat(createChatDto);
//   }

//   @SubscribeMessage('findAllChat')
//   findAll() {
//     return this.chatService.findAll();
//   }

//   @SubscribeMessage('findOneChat')
//   findOne(@MessageBody() id: number) {
//     return this.chatService.findOne(id);
//   }

//   // @SubscribeMessage('updateChat')
//   // update(@MessageBody() updateChatDto: UpdateChatDto) {
//   //   return this.chatService.update(updateChatDto.id, updateChatDto);
//   // }

//   @SubscribeMessage('removeChat')
//   remove(@MessageBody() id: number) {
//     return this.chatService.remove(id);
//   }
// }
