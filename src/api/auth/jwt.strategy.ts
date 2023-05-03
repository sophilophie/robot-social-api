import {Strategy} from 'passport-jwt';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable} from '@nestjs/common';
import {ExtractJwt} from 'passport-jwt';
import {ConfigService} from '@nestjs/config';
import {UserService} from '../user/user.service';
import {JwtPayload} from './auth-types';
import {User} from '../user/entity/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService, private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_KEY'),
    });
  }

  public async validate(payload: JwtPayload): Promise<User | null> {
    return this.userService.getUser(payload.id);
  }
}
