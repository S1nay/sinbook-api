import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

import {
  CannotDeleteCommentException,
  CannotModifyCommentException,
} from '#comment/exceptions/comment-exceptions';

import { CommentService } from '../comment.service';

@Injectable()
export class CommentActionGuard implements CanActivate {
  constructor(private readonly commentService: CommentService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const requestedCommentId = +request.params.id;
    const user = request.user as { user_id: number };
    const comment =
      await this.commentService.findCommentById(requestedCommentId);
    const method = request.method;

    const isAnotherUser = comment.userId !== user.user_id;

    if (isAnotherUser) {
      switch (method) {
        case 'PATCH': {
          throw new CannotModifyCommentException();
        }
        case 'DELETE': {
          throw new CannotDeleteCommentException();
        }
      }
    }

    return true;
  }
}
