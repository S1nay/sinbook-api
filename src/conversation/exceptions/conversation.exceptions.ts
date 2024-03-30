import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import {
  CANNOT_CREATE_CONVERSATION_WITH_YOURSELF,
  CONVERSATION_IS_ALREADY_EXIST,
  CONVERSATION_NOT_FOUND,
  HasNoAccessToConversation,
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

export class ConversationIsAlreadyExistException extends NotFoundException {
  constructor() {
    super(CONVERSATION_IS_ALREADY_EXIST);
  }
}

export class HasNoAccessToConversationException extends ForbiddenException {
  constructor() {
    super(HasNoAccessToConversation);
  }
}
