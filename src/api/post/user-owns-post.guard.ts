import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {UserService} from '../user/user.service';
import {JwtService} from '@nestjs/jwt';
import * as _ from 'lodash';

@Injectable()
export class UserOwnsPostGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService, private readonly userService: UserService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const jwt: string = context.switchToHttp().getRequest().headers.authorization.split(' ')[1] as string;
    const decodedJwt = this.jwtService.decode(jwt) as {id: number};
    const userWithPosts = await this.userService.getUser(decodedJwt.id);
    const resourceId = context.switchToHttp().getRequest().params.postId as string;
    if (userWithPosts) {
      let shouldActivate = false;
      _.forEach(userWithPosts.posts, (post) => {
        if (post.id === parseInt(resourceId)) {
          shouldActivate = true;
        }
      });
      return shouldActivate;
    }
    return false;
  }
}
