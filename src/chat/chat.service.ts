import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) {}

  async createChat(createChatDto: CreateChatDto) {
    const { name, usersId } = createChatDto;
    const users = await Promise.all(
      usersId.map(async (el: number | User) => {
        return (el = await this.userService.findOneUser(+el));
      }),
    );
    console.log(users);
    const newChat = await this.chatRepository.create({ name, users });
    return await this.chatRepository.save(newChat);
  }

  findAll() {
    return `This action returns all chat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  update(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
