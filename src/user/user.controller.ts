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
import { ApiOkResponse } from '@nestjs/swagger';
import { UserRto } from './rto/user.rto';
import { ChangeUserRto } from './rto/change-user.rto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOkResponse({
    description: 'Create user',
    type: UserRto,
    isArray: false,
  })
  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @ApiOkResponse({
    description: 'Get all users',
    type: ChangeUserRto,
    isArray: false,
  })
  @UseGuards(AuthGuard)
  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @ApiOkResponse({
    description: 'User profile',
    type: UserRto,
    isArray: false,
  })
  @UseGuards(AuthGuard)
  @Get('my-profile')
  getUserById(@UserId() userId: number) {
    return this.userService.getUserById(userId);
  }

  @ApiOkResponse({
    description: 'Update user',
    type: ChangeUserRto,
    isArray: false,
  })
  @UseGuards(AuthGuard)
  @Patch('my-profile')
  updateUser(@UserId() userId: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(userId, updateUserDto);
  }

  @ApiOkResponse({
    description: 'Delete user',
    type: ChangeUserRto,
    isArray: false,
  })
  @UseGuards(AuthGuard)
  @Delete('my-profile')
  removeUser(@UserId() userId: number) {
    return this.userService.removeUser(userId);
  }
}
