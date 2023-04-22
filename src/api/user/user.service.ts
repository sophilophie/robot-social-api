import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as _ from 'lodash';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  public getUser(userId: number): Promise<User> {
    return this.userRepository.findOne({where: {id: userId}});
  }

  public getUserByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({where: { username }});
  }

  public getUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  public async createUser(user: CreateUserDto): Promise<User> {
    const {
      username,
      firstName,
      lastName,
      email,
      password
    }: CreateUserDto = user;
    let createdUser = await this.getUserByUsername(username);
    if (createdUser) throw new ConflictException();
    createdUser = new User();
    createdUser.username = username;
    createdUser.firstName = firstName;
    createdUser.lastName = lastName;
    createdUser.email = email;
    createdUser.password = bcrypt.hashSync(password, bcrypt.genSaltSync());
    
    return this.userRepository.save(createdUser);
  }

  public async updateUser(userId: number, user: UpdateUserDto): Promise<User> {
    const updateUser = await this.userRepository.findOne({where: {id: userId}});
    if (updateUser) {
      await this.userRepository.update(userId, user);
      return {...updateUser, ...user};
    }
    throw new NotFoundException();
  }

  public async deleteUser(userId: number): Promise<User> {
    const deleteUser = await this.userRepository.findOne({where: {id: userId}});
    if (deleteUser) {
      return this.userRepository.remove(deleteUser);
    }
    throw new NotFoundException();
  }
}
