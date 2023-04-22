import { Body, Controller, Post } from '@nestjs/common';
import { SkipJwtAuth } from '../../common/decorators/skip-jwt.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) {}

  @SkipJwtAuth()
  @Post('login')
  login(@Body() loginDto: LoginDto): Promise<any> {
    return this.authService.login(loginDto);
  }
}
