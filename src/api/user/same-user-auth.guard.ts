import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {Observable} from 'rxjs';

@Injectable()
export class SameUserAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  public canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const jwt: string = context.switchToHttp().getRequest().headers.authorization.split(' ')[1] as string;
    const decodedJwt = this.jwtService.decode(jwt) as {id: string};
    const resourceId = context.switchToHttp().getRequest().params.userId as string;
    if (decodedJwt?.id === resourceId) return true;
    return false;
  }
}
