import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserId } from 'src/common/get-user.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.userService.getAllUsers();
  }

  @UseGuards(AuthGuard)
  @Get('my-profile')
  getUserById(@UserId() userId: number) {
    console.log(userId, 'kkkkkkkkkkkkkkkk');
    return this.userService.getUserById(userId);
  }

  @UseGuards(AuthGuard)
  @Patch('my-profile')
  update(@UserId() userId: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(userId, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @Delete('my-profile')
  remove(@UserId() userId: number) {
    return this.userService.removeUser(userId);
  }
}
