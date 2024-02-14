import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { CANNOT_MODIFY_USER } from 'src/user/constants/user.constants';

@Injectable()
export class UserActionGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const { user_id } = request.user as { user_id: number };
    const requestedUserId = +request.params.id;

    if (requestedUserId !== user_id) {
      throw new ForbiddenException(CANNOT_MODIFY_USER);
    }

    return true;
  }
}
