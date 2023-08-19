import {ConflictException, Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {UserModel} from './entity/user.entity';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import {JwtPayload, JwtResponse} from '../auth/auth-types';
import {JwtService} from '@nestjs/jwt';
import {CreateFriendshipDto} from './dto/create-friendship.dto';
import * as _ from 'lodash';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    private readonly jwtService: JwtService,
  ) {}

  public getUser(userId: number): Promise<UserModel | null> {
    return this.userRepository.findOne({where: {id: userId}});
  }

  public async getUserWithFriends(userId: number): Promise<UserModel | null> {
    const foundUser = await this.getUserAndFriendsByUserId(userId);
    if (foundUser) return foundUser;
    throw new NotFoundException();
  }

  private getUserByUsername(username: string): Promise<UserModel | null> {
    return this.userRepository.findOne({where: {username}});
  }

  public getUserByEmail(email: string): Promise<UserModel | null> {
    return this.userRepository.findOne({where: {email}});
  }

  public getUsers(): Promise<UserModel[]> {
    return this.userRepository.find({select: ['firstName', 'lastName', 'username', 'email', 'id']});
  }

  public async createUser(user: CreateUserDto): Promise<JwtResponse> {
    const {username, firstName, lastName, email, password}: CreateUserDto = user;
    // It seems more likely that a conflicting username exists than a conflicting email, so we cascade.
    let createdUser = (await this.getUserByUsername(username)) ?? (await this.getUserByEmail(email));
    if (createdUser) throw new ConflictException();
    createdUser = new UserModel();
    createdUser.username = username;
    createdUser.firstName = firstName;
    createdUser.lastName = lastName;
    createdUser.email = email;
    createdUser.password = bcrypt.hashSync(password, bcrypt.genSaltSync());

    const newUser = await this.userRepository.save(createdUser);
    delete newUser?.password;
    if (newUser) {
      const payload: JwtPayload = {
        username: newUser.username,
        id: newUser.id,
      };
      return {
        access_token: this.jwtService.sign(payload),
        user: newUser,
      };
    }
    throw new InternalServerErrorException();
  }

  public async updateUser(userId: number, user: UpdateUserDto): Promise<UserModel> {
    const updateUser = await this.userRepository.findOne({where: {id: userId}});
    if (updateUser) {
      await this.userRepository.update(userId, user);
      const updateUserFriends = await this.findFriendsByUserId(updateUser.id);
      updateUser.friends = updateUserFriends;
      delete updateUser?.password;
      return {...updateUser, ...user};
    }
    throw new NotFoundException();
  }

  public async deleteUser(userId: number): Promise<UserModel> {
    const deleteUser = await this.userRepository.findOne({where: {id: userId}});
    if (deleteUser) {
      return this.userRepository.remove(deleteUser);
    }
    throw new NotFoundException();
  }

  public async createFriendship(friendship: CreateFriendshipDto): Promise<UserModel | null> {
    const updateUser = await this.getUserAndFriendsByUserId(friendship.userId);
    if (updateUser) {
      if (_.some(updateUser.friends, (friend) => friend.id === friendship.friendId)) {
        return updateUser;
      } else {
        await this.userRepository.query(
          `
            INSERT INTO "user_friends_user" ("userId", "friendId")
            VALUES ($1, $2)
          `,
          [friendship.userId, friendship.friendId],
        );
        return this.getUserAndFriendsByUserId(friendship.userId);
      }
    }
    throw new NotFoundException();
  }

  private findFriendsByUserId(id: number): Promise<UserModel[]> {
    return this.userRepository.query(
      `
        SELECT id,username,"firstName","lastName",email
        FROM "user" AS U
        WHERE U.id <> $1
          AND EXISTS(
            SELECT 1
            FROM "user_friends_user" AS F
            WHERE (F."userId" = $1 AND F."friendId" = U.id)
            OR (F."friendId" = $1 AND F."userId" = U.id)
          )
      `,
      [id],
    );
  }

  private async getUserAndFriendsByUserId(userId: number): Promise<UserModel | null> {
    const user = await this.userRepository.findOne({where: {id: userId}});
    if (user) {
      user.friends = await this.findFriendsByUserId(userId);
      delete user?.password;
    }
    return user;
  }

  public async getUserAndFriendsbyUsername(username: string): Promise<UserModel | null> {
    return this.userRepository.findOne({where: {username}, relations: {friends: true}});
  }
}
