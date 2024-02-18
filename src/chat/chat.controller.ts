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

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(AuthGuard)
  @Post()
  createChat(@Body() createChatDto: CreateChatDto) {
    console.log('doshlo controller');
    return this.chatService.createChat(createChatDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAllChat() {}

  @UseGuards(AuthGuard)
  @Patch(':id')
  updateChat(@Param() id: number) {}

  @UseGuards(AuthGuard)
  @Delete(':id')
  removeChat(@Param() id: number) {}
}
