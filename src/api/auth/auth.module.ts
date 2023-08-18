import {Module} from '@nestjs/common';
import {PassportModule} from '@nestjs/passport';
import {SharedModule} from '../../shared/shared.module';
import {UserModule} from '../user/user.module';
import {AuthController} from './auth.controller';
import {AuthService} from './auth.service';
import {JwtStrategy} from './jwt.strategy';

@Module({
  imports: [UserModule, PassportModule, SharedModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
