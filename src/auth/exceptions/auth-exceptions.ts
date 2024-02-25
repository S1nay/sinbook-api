import { BadRequestException, UnauthorizedException } from '@nestjs/common';

import {
  INCORRECT_AUTH_DATA,
  INVALID_TOKEN,
  NO_AUTH,
  USER_WITH_EMAIL_EXIST,
  USER_WITH_EMAIL_NOT_EXIST,
} from '../constants/auth.constants';

export class IncorrectAuthDataException extends BadRequestException {
  constructor() {
    super(INCORRECT_AUTH_DATA);
  }
}

export class UserWithEmailNotExistException extends BadRequestException {
  constructor() {
    super(USER_WITH_EMAIL_NOT_EXIST);
  }
}

export class UserWithEmailExistException extends BadRequestException {
  constructor() {
    super(USER_WITH_EMAIL_EXIST);
  }
}

export class InvalidTokenException extends UnauthorizedException {
  constructor() {
    super(INVALID_TOKEN);
  }
}

export class UserNotAuthorizedException extends UnauthorizedException {
  constructor() {
    super(NO_AUTH);
  }
}
