import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

import {
  CANNOT_CREATE_CONVERSATION_WITH_YOURSELF,
  CONVERSATION_IS_ALREADY_EXIST,
  CONVERSATION_NOT_FOUND,
  HAS_NO_ACCESS_TO_CONVERSATION,
  INVALID_CONVERSATION_ID,
} from '../constants/conversation.constants';

export class ConversationNotFoundException extends NotFoundException {
  constructor() {
    super(CONVERSATION_NOT_FOUND);
  }
}

export class CannotCreateConversationWithYourselfException extends BadRequestException {
  constructor() {
    super(CANNOT_CREATE_CONVERSATION_WITH_YOURSELF);
  }
}

export class ConversationIsAlreadyExistException extends WsException {
  constructor() {
    super(CONVERSATION_IS_ALREADY_EXIST);
  }
}

export class HasNoAccessToConversationException extends WsException {
  constructor() {
    super(HAS_NO_ACCESS_TO_CONVERSATION);
  }
}

export class InvalidaConversationIdException extends WsException {
  constructor() {
    super(INVALID_CONVERSATION_ID);
  }
}
