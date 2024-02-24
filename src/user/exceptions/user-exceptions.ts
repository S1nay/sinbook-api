import { NotFoundException } from '@nestjs/common';
import { USER_NOT_FOUND } from '../constants/user.constants';

export class UserNotFoundException extends NotFoundException {
  constructor() {
    super(USER_NOT_FOUND);
  }
}
