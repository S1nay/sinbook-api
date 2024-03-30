import { ForbiddenException, NotFoundException } from '@nestjs/common';

import {
  HAS_NO_ACCESS_FOR_SEND_MESSAGE,
  MESSAGE_NOT_FOUND,
} from '#message/constants/message.constants';

export class HasNoAccessForSendMessageException extends ForbiddenException {
  constructor() {
    super(HAS_NO_ACCESS_FOR_SEND_MESSAGE);
  }
}

export class HasNoAccessForEditMessageException extends ForbiddenException {
  constructor() {
    super(HAS_NO_ACCESS_FOR_SEND_MESSAGE);
  }
}

export class MessageNotFoundException extends NotFoundException {
  constructor() {
    super(MESSAGE_NOT_FOUND);
  }
}
