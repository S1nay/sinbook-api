import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

import {
  CannotDeletePostException,
  CannotModifyPostException,
} from '#post/exceptions/post-exceptions';

import { PostService } from '../post.service';

@Injectable()
export class PostActionGuard implements CanActivate {
  constructor(private readonly postService: PostService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const requestedPostId = +request.params.id;
    const user = request.user as { user_id: number };
    const post = await this.postService.findPostById(requestedPostId);
    const method = request.method;

    const isAnotherUser = post.user.id !== user.user_id;

    if (isAnotherUser) {
      switch (method) {
        case 'PATCH': {
          throw new CannotModifyPostException();
        }
        case 'DELETE': {
          throw new CannotDeletePostException();
        }
      }
    }

    return true;
  }
}
