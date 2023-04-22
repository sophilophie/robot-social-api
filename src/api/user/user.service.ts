import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

@Injectable()
export class UserService {
  private users: User[] = [
    {id: 0, username: 'testUser0', firstName: 'user', lastName: 'name', email: 'user@name0.com', password: 'someHash'},
    {id: 1, username: 'testUser1', firstName: 'user', lastName: 'name', email: 'user@name1.com', password: 'someHash'},
    {id: 2, username: 'testUser2', firstName: 'user', lastName: 'name', email: 'user@name2.com', password: 'someHash'},
    {id: 3, username: 'testUser3', firstName: 'user', lastName: 'name', email: 'user@name3.com', password: 'someHash'},
    {id: 4, username: 'testUser4', firstName: 'user', lastName: 'name', email: 'user@name4.com', password: 'someHash'},
    {id: 5, username: 'testUser5', firstName: 'user', lastName: 'name', email: 'user@name5.com', password: 'someHash'},
    {id: 6, username: 'testUser6', firstName: 'user', lastName: 'name', email: 'user@name6.com', password: 'someHash'}
  ];

  public getUsers(): User[] {
    return this.users;
  }

  public getUser(userId: number): User {
    return this.users[userId];
  }

  public postUser(user: User): User {
    this.users.push(user);
    return this.users[user.id];
  }

  public putUser(userId: number, user: User): User {
    this.users[userId] = user;
    return this.users[userId];
  }

  public deleteUser(userId: number): User {
    const tempUser = _.cloneDeep(this.users[userId]);
    delete this.users[userId];
    this.users = _.omitBy(this.users, _.isNil) as User[];
    return tempUser;
  }
}