import {Module} from '@nestjs/common';
import {UserModule} from './api/user/user.module';
import {ConfigModule} from '@nestjs/config';
import {getEnvPath} from './common/helpers/env.helper';
import {TypeOrmModule} from '@nestjs/typeorm';
import {TypeOrmConfigService} from './shared/typeorm/typeorm.service';
import {AuthModule} from './api/auth/auth.module';
import {APP_GUARD} from '@nestjs/core';
import {JwtAuthGuard} from './api/auth/jwt-auth.guard';
import {PostModule} from './api/post/post.module';

const envFilePath: string = getEnvPath(`${__dirname}/common/envs`);

@Module({
  imports: [
    ConfigModule.forRoot({envFilePath, isGlobal: true}),
    TypeOrmModule.forRootAsync({useClass: TypeOrmConfigService}),
    UserModule,
    AuthModule,
    PostModule,
  ],
  providers: [{provide: APP_GUARD, useClass: JwtAuthGuard}],
})
export class AppModule {}
