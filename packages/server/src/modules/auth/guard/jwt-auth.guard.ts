import { User } from './../../user/user.entity';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt-access') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<User>(err, user: User, info, context): User {
    if (err || !user) {
      throw err || new UnauthorizedException('Not Authorized');
    }
    return user;
  }
}
