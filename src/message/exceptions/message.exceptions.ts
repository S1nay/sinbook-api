import { WsException } from '@nestjs/websockets';

import {
  HAS_NO_ACCESS_FOR_EDIT_MESSAGE,
  HAS_NO_ACCESS_FOR_SEND_MESSAGE,
  MESSAGE_NOT_FOUND,
} from '#message/constants/message.constants';

export class HasNoAccessForSendMessageException extends WsException {
  constructor() {
    super(HAS_NO_ACCESS_FOR_SEND_MESSAGE);
  }
}

export class HasNoAccessForEditMessageException extends WsException {
  constructor() {
    super(HAS_NO_ACCESS_FOR_EDIT_MESSAGE);
  }
}

export class MessageNotFoundException extends WsException {
  constructor() {
    super(MESSAGE_NOT_FOUND);
  }
}
