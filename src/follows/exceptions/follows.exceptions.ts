import { BadRequestException } from '@nestjs/common';

import {
  FOLLOW_IS_ALREADY_EXIST,
  FOLLOW_IS_NOT_EXIST,
} from '#follows/constants/follows.constants';

export class FollowIsAlreadyExistException extends BadRequestException {
  constructor() {
    super(FOLLOW_IS_ALREADY_EXIST);
  }
}

export class FollowIsNotExistException extends BadRequestException {
  constructor() {
    super(FOLLOW_IS_NOT_EXIST);
  }
}
