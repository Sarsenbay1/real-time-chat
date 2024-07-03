import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message-dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async createChat(userId: number, createChatDto: CreateChatDto) {
    const { name, usersId } = createChatDto;

    const users = await Promise.all(
      usersId.map(async (el: number | User) => {
        return (el = await this.userService.getUserById(+el));
      }),
    );

    users.push(await this.userService.getUserById(userId));
    console.log(users);
    const newChat = await this.chatRepository.create({
      createrId: userId,
      name: name,
      users: users,
    });
    return await this.chatRepository.save(newChat);
  }

  async getAllChat(userId: number) {
    // const user = this.userRepository.findOneBy({ id: id });
    const chats = await this.chatRepository.find({
      where: { users: { id: userId } },
    });
    return chats;
  }

  async getOneChat(id: number) {
    const chat = await this.chatRepository.findOneBy({ id: id });
    return chat;
  }

  async updateChat(id: number, updateChatDto: UpdateChatDto, userId: number) {
    const chat = await this.getOneChat(id);
    const user = await this.userService.getUserById(userId);
    const { name, usersId } = updateChatDto;
    if (chat.createrId === userId) {
      chat.name = name;
      chat.users = await Promise.all(
        usersId.map(async (el) => await this.userService.getUserById(el)),
      );
      chat.users.push(await this.userService.getUserById(userId));
      await this.chatRepository.save(chat);
    }

    // console.log(chat.users, '___________________________/////////////S');
    console.log(user);
    console.log(updateChatDto);
    return chat;
  }

  async removeChat(id: number, userId: number): Promise<Chat> {
    const chat = await this.getOneChat(id);
    // const user = await this.userService.getUserById(userId);
    if (chat.createrId === userId) {
      return await this.chatRepository.remove(chat);
    } else {
      throw new ForbiddenException();
    }
  }

  //for message
  async createMessage(sendMessage: CreateMessageDto): Promise<Message> {
    const message = new Message();
    // const chat = await this.getOneChat(sendMessage.chatId);
    const chat = await this.chatRepository.findOne({
      where: { id: sendMessage.chatId },
      relations: ['users'],
    });
    const user = await this.userService.getUserById(sendMessage.userId);

    // await console.log(
    //   await chat.users.some((el) => el.id == user.id),
    //   '1212121212',
    // );
    // if (!chat) {
    //   throw new Error('Chat not found');
    // }

    // if (!chat.users) {
    //   throw new Error('Users not found in chat');
    // }
    // for (let index = 0; index < chat.users.length; index++) {
    //   const element = chat.users[index];
    //   console.log(element);
    // }
    // console.log(await chat, '--------------', user.id);
    // console.log(chat.users.some(async (el) => el.id == user.id));
    if (chat.users.some(async (el) => el.id == user.id)) {
      message.chat = chat;
      message.user = user;
      message.content = sendMessage.content;
      message.date_sending = new Date();
      // message_

      // console.logserId);
      console.log(message);
      return await this.messageRepository.save(message);
    } else {
      throw new Error('User is not part of the chat');
    }
  }

  async getMessages(chatId: number): Promise<Message[]> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: ['messages'],
    });

    return await this.messageRepository.findBy({ chat: chat });
  }
}
