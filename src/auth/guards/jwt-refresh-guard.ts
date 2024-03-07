import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { JsonWebTokenError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

import { InvalidTokenException } from '../exceptions/auth-exceptions';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  constructor() {
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
      throw new InvalidTokenException();
    }
    return super.handleRequest(err, user, info, context, status);
  }
}
