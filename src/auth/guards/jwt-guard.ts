import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JsonWebTokenError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { UserNotAuthorizedException } from '../exceptions/auth-exceptions';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  handleRequest(
    err: unknown,
    user: unknown,
    info: JsonWebTokenError,
    context: ExecutionContext,
    status?: HttpStatus,
  ) {
    if (info instanceof JsonWebTokenError) {
      throw new UserNotAuthorizedException();
    }
    return super.handleRequest(err, user, info, context, status);
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
