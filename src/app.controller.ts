import {Controller, Get} from '@nestjs/common';
import {AppService} from './app.service';
import {SkipJwtAuth} from './common/decorators/skip-jwt.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @SkipJwtAuth()
  @Get()
  public getHello(): string {
    return this.appService.getHello();
  }
}
