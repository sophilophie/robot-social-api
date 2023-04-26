import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entity/user.entity';
import { UserService } from '../user/user.service';
import { JwtPayload, JwtResponse } from './auth-types';
import { LoginDto } from './dto/login.dto';
import { RefreshUserDto } from '../user/dto/refresh-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {

  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto): Promise<JwtResponse> {
    const loginUser = await this.userService.getUserByUsername(loginDto.username);

    if (loginUser && bcrypt.compareSync(loginDto.password, loginUser.password)) {
      const payload: JwtPayload = { username: loginUser.username, id: loginUser.id };
      delete loginUser.password;
      return {
        access_token: this.jwtService.sign(payload),
        user: loginUser
      };
    }
    throw new UnauthorizedException();
  }

  async refresh(refreshDto: RefreshUserDto): Promise<JwtResponse> {
    const decodedJwt = this.jwtService.decode(refreshDto.access_token);
    const refreshUser: User = await this.userService.getUser((decodedJwt as JwtPayload).id);
    if (refreshUser) {
      const payload: JwtPayload = { username: refreshUser.username, id: refreshUser.id };
      delete refreshUser.password;
      return {
        access_token: this.jwtService.sign(payload),
        user: refreshUser
      };
    }
    throw new UnauthorizedException();
  }
}