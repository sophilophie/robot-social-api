import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entity/user.entity';
import * as _ from 'lodash';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  public getUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  public getUser(userId: number): Promise<User> {
    return this.userRepository.findOneOrFail({where: {id: userId}});
  }

  public postUser(user: CreateUserDto): Promise<User> {
    return this.userRepository.save(user);
  }

  public async putUser(userId: number, user: UpdateUserDto): Promise<User> {
    const updateUser = await this.userRepository.findOneOrFail({where: {id: userId}});
    await this.userRepository.update(userId, user);
    return {...updateUser, ...user};
  }

  public async deleteUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({where: {id: userId}});
    return this.userRepository.remove(user);
  }
}
