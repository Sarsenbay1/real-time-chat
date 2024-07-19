import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message-dto';
import { Redis } from 'ioredis';

@Injectable()
export class ChatService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly userService: UserService,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async createChat(userId: number, createChatDto: CreateChatDto) {
    createChatDto.usersId = [...new Set(createChatDto.usersId)];

    const { name, usersId } = createChatDto;

    const users = await Promise.all(
      usersId.map(async (el: number | User) => {
        return (el = await this.userService.getUserById(+el));
      }),
    );

    users.push(await this.userService.getUserById(userId));

    const newChat = await this.chatRepository.create({
      createrId: userId,
      name: name,
      users: users,
    });
    return await this.chatRepository.save(newChat);
  }

  async getAllChat(userId: number) {
    const user = this.userService.getUserById(userId);
    return (await user).chats;
  }

  async getOneChat(id: number) {
    const chat = await this.chatRepository.findOneBy({ id: id });
    if (!chat) {
      throw new NotFoundException(`Chat with ID ${id} not found`);
    }
    return chat;
  }

  async updateChat(id: number, updateChatDto: UpdateChatDto, userId: number) {
    const chat = await this.getOneChat(id);
    // const user = await this.userService.getUserById(userId);
    const { name, usersId } = updateChatDto;
    if (chat.createrId === userId) {
      chat.name = name;
      chat.users = await Promise.all(
        usersId.map(async (el) => await this.userService.getUserById(el)),
      );
      chat.users.push(await this.userService.getUserById(userId));
      await this.chatRepository.save(chat);
    }

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
    try {
    } catch (error) {}
    const chat = await this.chatRepository.findOne({
      where: { id: sendMessage.chatId },
      relations: ['users'],
    });
    const user = await this.userService.getUserById(sendMessage.userId);

    if (!chat) {
      throw new Error('Chat not found');
    }
    if (!user) {
      throw new Error('User not found');
    }

    if (!chat.users) {
      throw new Error('Users not found in chat');
    }

    if (chat.users.some(async (el) => el.id == user.id)) {
      message.chat = chat;
      message.user = user;
      message.content = sendMessage.content;
      message.date_sending = new Date();
      // message_
      const savedMessage = await this.messageRepository.save(message);

      // Кэширование сообщения в Redis
      await this.redis.lpush(
        `chat:${chat.id}:messages`,
        JSON.stringify(savedMessage),
      );
      return savedMessage;
    } else {
      throw new Error('User is not part of the chat');
    }
  }

  async getMessages(chatId: number): Promise<Message[]> {
    const cacheKey = `chat:${chatId}:messages`;

    // Попытка получить сообщения из кэша Redis
    const cachedMessages = await this.redis.lrange(cacheKey, 0, -1);

    // Если сообщения найдены в кэше, возвращаем их
    if (cachedMessages.length > 0) {
      return cachedMessages.map((message) => JSON.parse(message));
    }

    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: ['messages'],
    });
    if (!chat) {
      throw new Error('Chat not found');
    }
    const messages = await this.messageRepository.find({
      where: { chat: chat },
      relations: ['user'],
    });
    if (!messages) {
      throw new Error('Messages not found');
    }

    await Promise.all(
      messages.map((message) =>
        this.redis.lpush(cacheKey, JSON.stringify(message)),
      ),
    );

    return messages;
  }
}
