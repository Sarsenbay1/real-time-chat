import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UserId } from 'src/common/get-user.decorator';
import { UpdateChatDto } from './dto/update-chat.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { CreateChatRto } from './rto/create-chat.rto';
import { ChatRto } from './rto/chat.rto';
import { GetMessagesRto } from './rto/get-message.rto';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOkResponse({
    description: 'Create Chat',
    type: CreateChatRto,
    isArray: false,
  })
  @UseGuards(AuthGuard)
  @Post()
  createChat(@UserId() UserId: number, @Body() createChatDto: CreateChatDto) {
    console.log('doshlo controller');
    return this.chatService.createChat(UserId, createChatDto);
  }

  @ApiOkResponse({
    description: 'Get Chats',
    type: ChatRto,
    isArray: true,
  })
  @UseGuards(AuthGuard)
  @Get('my-chats')
  getAllChat(@UserId() id: number) {
    return this.chatService.getAllChat(id);
  }

  @ApiOkResponse({
    description: 'Get a message from a chat',
    type: GetMessagesRto,
    isArray: true,
  })
  @UseGuards(AuthGuard)
  @Get('my-chats/:id')
  getChatMessage(@Param('id') chatId: number) {
    return this.chatService.getMessages(chatId);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  updateChat(
    @Param('id') id: number,
    @Body() updateChatDto: UpdateChatDto,
    @UserId() userId: number,
  ) {
    return this.chatService.updateChat(id, updateChatDto, userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  removeChat(@Param() id: number, @UserId() userId: number) {
    return this.chatService.removeChat(id, userId);
  }
  //
  // @Get('/chat')
  // @Render('index')
  // Home() {
  //   return;
  // }

  // @Get('/api/chat')
  // async Chat(@Res() res) {
  //   const messages = await this.chatService.getMessages();
  //   res.json(messages);
  // }
}
