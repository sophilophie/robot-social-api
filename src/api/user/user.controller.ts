import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {SkipJwtAuth} from '../../common/decorators/skip-jwt.decorator';
import {JwtResponse} from '../auth/auth-types';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {UserModel} from './entity/user.entity';
import {UserService} from './user.service';
import {CreateFriendshipDto} from './dto/create-friendship.dto';
import {SameUserAuthGuard} from './same-user-auth.guard';
import {CreateFriendRequestDto} from './dto/create-friend-request.dto';
import {FriendRequestModel} from './entity/friend-request.entity';
import {FriendshipModel} from './entity/friendship.entity';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  public getUsers(): Promise<UserModel[]> {
    return this.userService.getUsers();
  }

  @Get('search')
  public userSearch(
    @Query('searchTerm') searchTerm: string,
    @Query('userId') userId: string,
  ): Promise<UserModel[] | null> {
    return this.userService.search(searchTerm, userId);
  }

  @Get(':userId')
  public getUser(@Param('userId') userId: string): Promise<UserModel | null> {
    return this.userService.getUser(userId);
  }

  @SkipJwtAuth()
  @Post()
  public postUser(@Body() createUserDto: CreateUserDto): Promise<JwtResponse | InternalServerErrorException> {
    return this.userService.createUser(createUserDto);
  }

  @Post('friendship')
  public postUserFriendship(@Body() createFriendshipDto: CreateFriendshipDto): Promise<FriendshipModel | null> {
    return this.userService.createFriendship(createFriendshipDto);
  }

  @Post('friend-request')
  public postFriendRequest(@Body() createFriendRequestDto: CreateFriendRequestDto): Promise<FriendRequestModel | null> {
    return this.userService.createFriendRequest(createFriendRequestDto);
  }

  @UseGuards(SameUserAuthGuard)
  @Put(':userId')
  public putUser(@Param('userId') userId: string, @Body() updateUserDto: UpdateUserDto): Promise<UserModel | null> {
    return this.userService.updateUser(userId, updateUserDto);
  }

  @UseGuards(SameUserAuthGuard)
  @Delete(':userId')
  public deleteUser(@Param('userId') userId: string): Promise<UserModel> {
    return this.userService.deleteUser(userId);
  }
}
