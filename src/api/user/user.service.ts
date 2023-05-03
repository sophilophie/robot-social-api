import {ConflictException, Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {User} from './entity/user.entity';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import {JwtPayload, JwtResponse} from '../auth/auth-types';
import {JwtService} from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  public getUser(userId: number): Promise<User | null> {
    return this.userRepository.findOne({where: {id: userId}});
  }

  public getUserByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({where: {username}});
  }

  public getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({where: {email}});
  }

  public getUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  public async createUser(user: CreateUserDto): Promise<JwtResponse | InternalServerErrorException> {
    const {username, firstName, lastName, email, password}: CreateUserDto = user;
    // It seems more likely that a conflicting username exists than a conflicting email, so we cascade.
    let createdUser = (await this.getUserByUsername(username)) ?? (await this.getUserByEmail(email));
    if (createdUser) throw new ConflictException();
    createdUser = new User();
    createdUser.username = username;
    createdUser.firstName = firstName;
    createdUser.lastName = lastName;
    createdUser.email = email;
    createdUser.password = bcrypt.hashSync(password, bcrypt.genSaltSync());

    const newUser = await this.userRepository.save(createdUser);
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
    return new InternalServerErrorException();
  }

  public async updateUser(userId: number, user: UpdateUserDto): Promise<User> {
    const updateUser = await this.userRepository.findOne({
      where: {id: userId},
    });
    if (updateUser) {
      await this.userRepository.update(userId, user);
      return {...updateUser, ...user};
    }
    throw new NotFoundException();
  }

  public async deleteUser(userId: number): Promise<User> {
    const deleteUser = await this.userRepository.findOne({
      where: {id: userId},
    });
    if (deleteUser) {
      return this.userRepository.remove(deleteUser);
    }
    throw new NotFoundException();
  }
}
