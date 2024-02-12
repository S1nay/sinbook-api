import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { CANNOT_DELETE_USER } from 'src/user/constants/user.constants';

@Injectable()
export class UserActionGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    const deletedUserId = +request.params.id;

    const token = authorization.split(' ')[1];

    const userData: { userId: number } = this.jwtService.decode(token);

    if (deletedUserId !== userData.userId) {
      throw new ForbiddenException(CANNOT_DELETE_USER);
    }

    return true;
  }
}
