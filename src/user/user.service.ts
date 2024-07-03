import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async createUser(createUserDto: CreateUserDto) {
    const { username, password } = createUserDto;
    const hash = await bcrypt.hash(password, 3);

    const user = await this.userRepository.create({ username, password: hash });
    return await this.userRepository.save(user);
  }

  async getAllUsers() {
    const user = await this.userRepository.find({ select: ['id', 'username'] });
    return user ? user : null;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const user = await this.userRepository.findOneBy({ id: id });
    return user;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const { username, password } = updateUserDto;
    const user = await this.userRepository.findOneBy({ id: id });
    user.username = username;
    user.password = await bcrypt.hash(password, 3);
    return await this.userRepository.save(user);
  }

  async removeUser(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: id });
    return await this.userRepository.remove(user);
  }
}
