import { ForbiddenException, NotFoundException } from '@nestjs/common';

import {
  CANNOT_DELETE_POST,
  CANNOT_MODIFY_POST,
  POST_NOT_FOUND,
} from '../constants/post.constants';

export class PostNotFoundException extends NotFoundException {
  constructor() {
    super(POST_NOT_FOUND);
  }
}

export class CannotModifyPostException extends ForbiddenException {
  constructor() {
    super(CANNOT_MODIFY_POST);
  }
}

export class CannotDeletePostException extends ForbiddenException {
  constructor() {
    super(CANNOT_DELETE_POST);
  }
}
