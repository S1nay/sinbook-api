import { BadRequestException, NotFoundException } from '@nestjs/common';

import {
  CANNOT_DELETE_COMMENT,
  CANNOT_MODIFY_COMMENT,
  COMMENT_NOT_FOUND,
} from '#comment/constants/comment.constants';

export class CommentNotFoundException extends NotFoundException {
  constructor() {
    super(COMMENT_NOT_FOUND);
  }
}

export class CannotModifyCommentException extends BadRequestException {
  constructor() {
    super(CANNOT_MODIFY_COMMENT);
  }
}

export class CannotDeleteCommentException extends BadRequestException {
  constructor() {
    super(CANNOT_DELETE_COMMENT);
  }
}
