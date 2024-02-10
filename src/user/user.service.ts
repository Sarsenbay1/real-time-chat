import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async createUser(createUserDto: CreateUserDto) {
    const { username, password } = createUserDto;
    const user = await this.userRepository.create({ username, password });
    return await this.userRepository.save(user);
  }

  async findAll() {
    const user = await this.userRepository.find({ select: ['id', 'username'] });
    return user ? user : null;
  }

  async findOneUser(id: number): Promise<User | undefined> {
    const user = await this.userRepository.findOneBy({ id: id });
    return user;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const { username, password } = updateUserDto;
    const user = await this.userRepository.findOneBy({ id: id });
    user.username = username;
    user.password = password;
    return await this.userRepository.save(user);
  }

  async removeUser(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: id });
    return await this.userRepository.remove(user);
  }
}
