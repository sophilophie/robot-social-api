import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entity/user.entity';
import { UserService } from './user.service';

@Controller('users')
export class UserController {

  constructor(private userService: UserService) {}

  @Get()
  getUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }

  @Get(':userId')
  getUser(@Param('userId', ParseIntPipe) userId: number): Promise<User> {
    return this.userService.getUser(userId);
  }

  @Post()
  postUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.postUser(createUserDto);
  }

  @Put(':userId')
  putUser(@Param('userId', ParseIntPipe) userId: number, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.userService.putUser(userId, updateUserDto);
  }

  @Delete(':userId')
  deleteUser(@Param('userId', ParseIntPipe) userId: number): Promise<User> {
    return this.userService.deleteUser(userId);
  }
}
