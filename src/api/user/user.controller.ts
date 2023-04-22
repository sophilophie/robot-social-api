import { Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { Request } from 'express';
import { User, UserService } from './user.service';

@Controller('users')
export class UserController {

  constructor(private userService: UserService) {}

  @Get()
  getUsers(): User[] {
    return this.userService.getUsers();
  }

  @Get(':userId')
  getUser(@Param() params: {userId: number}): User {
    return this.userService.getUser(params.userId);
  }

  @Post()
  postUser(@Req() request: Request): User {
    return this.userService.postUser(request.body);
  }

  @Put(':userId')
  putUser(@Param() params: {userId: number}, @Req() request: Request): User {
    return this.userService.putUser(params.userId, request.body);
  }

  @Delete(':userId')
  deleteUser(@Param() params: {userId: number}): User {
    return this.userService.deleteUser(params.userId);
  }
}
