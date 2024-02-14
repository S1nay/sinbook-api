import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isSkipAuth = this.reflector.get<boolean>(
      'skip-auth',
      context.getHandler(),
    );

    if (isSkipAuth) {
      return true;
    }

    return super.canActivate(context);
  }
}
