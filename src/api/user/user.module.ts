import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {SharedModule} from '../../shared/shared.module';
import {UserModel} from './entity/user.entity';
import {UserController} from './user.controller';
import {UserService} from './user.service';
import {FriendRequestModel} from './entity/friend-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserModel, FriendRequestModel]), SharedModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
