import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import {SkipJwtAuth} from '../../common/decorators/skip-jwt.decorator';
import {JwtResponse} from '../auth/auth-types';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {User} from './entity/user.entity';
import {UserService} from './user.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  public getUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }

  @Get(':userId')
  public getUser(@Param('userId', ParseIntPipe) userId: number): Promise<User | null> {
    return this.userService.getUser(userId);
  }

  @SkipJwtAuth()
  @Post()
  public postUser(@Body() createUserDto: CreateUserDto): Promise<JwtResponse | InternalServerErrorException> {
    return this.userService.createUser(createUserDto);
  }

  @Put(':userId')
  public putUser(@Param('userId', ParseIntPipe) userId: number, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.userService.updateUser(userId, updateUserDto);
  }

  @Delete(':userId')
  public deleteUser(@Param('userId', ParseIntPipe) userId: number): Promise<User> {
    return this.userService.deleteUser(userId);
  }
}
