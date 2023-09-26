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
import {FriendRequestModel} from './entity/friend-request.entity';
import {CreateFriendRequestDto} from './dto/create-friend-request.dto';
import {FriendshipModel} from './entity/friendship.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    @InjectRepository(FriendRequestModel)
    private readonly friendRequestRepository: Repository<FriendRequestModel>,
    @InjectRepository(FriendshipModel)
    private readonly friendshipRepository: Repository<FriendshipModel>,
    private readonly jwtService: JwtService,
  ) {}

  public async getUser(userId: number): Promise<UserModel | null> {
    const user = await this.userRepository.findOne({
      select: {
        firstName: true,
        lastName: true,
        username: true,
        id: true,
        email: true,
      },
      where: {id: userId},
      relations: {
        requestedFriends: {requestee: true},
        requestsReceived: {requestor: true},
      },
    });
    if (user) {
      const strippedUser = this.stripPasswordsFromFriendRequests(user);
      return this.getFriendshipsForUser(strippedUser);
    }
    throw new NotFoundException();
  }

  public async getUserWithPosts(userId: number): Promise<UserModel | null> {
    const user = await this.userRepository.findOne({where: {id: userId}, relations: {posts: true}});
    return user;
  }

  public async getUserByUsername(username: string): Promise<UserModel | null> {
    const user = await this.userRepository.findOne({
      where: {username},
      relations: {
        requestedFriends: {requestee: true},
        requestsReceived: {requestor: true},
      },
    });
    if (user) {
      const strippedUser = this.stripPasswordsFromFriendRequests(user);
      return this.getFriendshipsForUser(strippedUser);
    }
    return null;
  }

  public getUserByEmail(email: string): Promise<UserModel | null> {
    return this.userRepository.findOne({where: {email}});
  }

  public getUsers(): Promise<UserModel[]> {
    return this.userRepository.find({select: ['firstName', 'lastName', 'username', 'email', 'id']});
  }

  public search(searchTerm: string): Promise<UserModel[] | null> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.email', 'user.username', 'user.firstName', 'user.lastName'])
      .where(
        'LOWER(user.username) LIKE :term OR LOWER(user.email) LIKE :term OR LOWER(user.firstName) LIKE :term OR LOWER(user.lastName) LIKE :term',
        {
          term: `%${searchTerm.toLowerCase()}%`,
        },
      );

    const spaceSeparated = searchTerm.split(' ');
    if (spaceSeparated.length === 2) {
      if (spaceSeparated[0].includes(',')) {
        spaceSeparated[0] = spaceSeparated[0].substring(0, spaceSeparated[0].length - 1);
      }
      query.orWhere(
        'LOWER(user.firstName) LIKE :firstTerm AND LOWER(user.lastName) LIKE :lastTerm OR LOWER(user.firstName) LIKE :lastTerm AND LOWER(user.lastName) LIKE :firstTerm ',
        {
          firstTerm: `%${spaceSeparated[0].toLowerCase()}%`,
          lastTerm: `%${spaceSeparated[1].toLowerCase()}%`,
        },
      );
    }

    return query.getMany();
  }

  public async createUser(user: CreateUserDto): Promise<JwtResponse> {
    const {username, firstName, lastName, email, password}: CreateUserDto = user;
    // It seems more likely that a conflicting username exists than a conflicting email, so we cascade.
    let createdUser = (await this.getUserByUsername(username)) ?? (await this.getUserByEmail(email));
    if (createdUser) throw new ConflictException();
    createdUser = new UserModel();
    createdUser.username = username;
    createdUser.firstName = this.titleCase(firstName);
    createdUser.lastName = this.titleCase(lastName);
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

  public async updateUser(userId: number, user: UpdateUserDto): Promise<UserModel | null> {
    const updateUser = await this.userRepository.findOne({where: {id: userId}});
    if (updateUser) {
      await this.userRepository.update(userId, user);
      const userAfterUpdate = await this.getUser(updateUser.id);
      return userAfterUpdate;
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

  public async createFriendRequest(createFriendRequestDto: CreateFriendRequestDto): Promise<FriendRequestModel | null> {
    const requestorUser = await this.userRepository.findOne({where: {id: createFriendRequestDto.requestorId}});
    const requesteeUser = await this.userRepository.findOne({where: {id: createFriendRequestDto.requesteeId}});
    if (requestorUser && requesteeUser) {
      await this.friendRequestRepository.query(
        `
          INSERT INTO "friend_request" ("dateCreated", "requestorId", "requesteeId")
          VALUES ($1, $2, $3)
        `,
        [new Date(), createFriendRequestDto.requestorId, createFriendRequestDto.requesteeId],
      );
      return this.friendRequestRepository.findOne({where: {requestor: requestorUser, requestee: requesteeUser}});
    }
    throw new NotFoundException();
  }

  public async createFriendship(friendship: CreateFriendshipDto): Promise<UserModel | null> {
    const updateUser = await this.getUser(friendship.requesteeId);
    const hasRequest = !!_.find(updateUser?.requestsReceived, {requestor: {id: friendship.requestorId}});
    if (hasRequest) {
      if (_.some(updateUser?.friendships, (friend) => friend.id === friendship.requestorId)) {
        return updateUser;
      } else {
        await this.userRepository.query(
          `
            INSERT INTO "friendship" ("dateCreated", "userId", "friendId")
            VALUES ($1, $2, $3)
          `,
          [new Date(), friendship.requesteeId, friendship.requestorId],
        );
        await this.friendRequestRepository.query(
          `
            DELETE FROM "friend_request"
            WHERE "requesteeId" = $1
            AND "requestorId" = $2
          `,
          [friendship.requesteeId, friendship.requestorId],
        );
        return this.getUser(friendship.requesteeId);
      }
    }
    throw new NotFoundException();
  }

  private stripPasswordsFromFriendRequests(user: UserModel): UserModel {
    if (user.requestedFriends.length > 0) {
      user.requestedFriends.forEach((requestedFriend) => {
        delete requestedFriend.requestee.password;
      });
    }
    if (user.requestsReceived.length > 0) {
      user.requestsReceived.forEach((receivedRequest) => {
        delete receivedRequest.requestor.password;
      });
    }
    return user;
  }

  private async getFriendshipsForUser(user: UserModel): Promise<UserModel> {
    user.friendships = await this.friendshipRepository.find({
      where: [{user: {id: user.id}}, {friend: {id: user.id}}],
      relations: {user: true, friend: true},
    });
    user.friendships?.forEach((friendship: Partial<FriendshipModel>) => {
      if (friendship?.user?.id === user.id) {
        delete friendship.user;
      } else if (friendship?.friend?.id === user.id) {
        friendship.friend = friendship.user;
        delete friendship.user;
      }
      delete friendship.friend?.password;
    });
    return user;
  }

  public async getUserAndFriendsByUsername(username: string): Promise<UserModel | null> {
    return this.userRepository.findOne({where: {username}, relations: {friendships: true}});
  }

  private titleCase(input: string): string {
    const words = input.split(' ');
    const capitalizedWords = words.map((word) => {
      if (word) {
        return word[0].toUpperCase() + word.slice(1).toLowerCase();
      }
    });
    return capitalizedWords.join(' ');
  }
}
