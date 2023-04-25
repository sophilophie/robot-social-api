import { Body, Controller, Post } from '@nestjs/common';
import { SkipJwtAuth } from '../../common/decorators/skip-jwt.decorator';
import { RefreshUserDto } from '../user/dto/refresh-user.dto';
import { JwtResponse } from './auth-types';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) {}

  @SkipJwtAuth()
  @Post('login')
  login(@Body() loginDto: LoginDto): Promise<JwtResponse> {
    return this.authService.login(loginDto);
  }

  @SkipJwtAuth()
  @Post('refresh')
  refresh(@Body() refreshDto: RefreshUserDto): Promise<JwtResponse> {
    return this.authService.refresh(refreshDto);
  }
}
