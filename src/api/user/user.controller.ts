import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserService } from './user.service';

@Controller('users')
export class UserController {

  constructor(private userService: UserService) {}

  @Get()
  getUsers(): User[] {
    return this.userService.getUsers();
  }

  @Get(':userId')
  getUser(@Param('userId', ParseIntPipe) userId: number): User {
    return this.userService.getUser(userId);
  }

  @Post()
  postUser(@Body() createUserDto: CreateUserDto): User {
    return this.userService.postUser(createUserDto);
  }

  @Put(':userId')
  putUser(@Param('userId', ParseIntPipe) userId: number, @Body() updateUserDto: UpdateUserDto): User {
    return this.userService.putUser(userId, updateUserDto);
  }

  @Delete(':userId')
  deleteUser(@Param('userId', ParseIntPipe) userId: number): User {
    return this.userService.deleteUser(userId);
  }
}
