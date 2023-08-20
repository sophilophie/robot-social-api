import {Module} from '@nestjs/common';
import {PostController} from './post.controller';
import {PostService} from './post.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {PostModel} from './entity/post.entity';
import {UserService} from '../user/user.service';
import {SharedModule} from '../../shared/shared.module';
import {UserModel} from '../user/entity/user.entity';
import {FriendRequestModel} from '../user/entity/friend-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostModel, UserModel, FriendRequestModel]), SharedModule],
  controllers: [PostController],
  providers: [PostService, UserService],
})
export class PostModule {}
