import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

import { PostService } from '../post.service';
import { CANNOT_MODIFY_POST } from '../constants/post.constants';

@Injectable()
export class PostActionGuard implements CanActivate {
  constructor(private readonly postService: PostService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const requestedPostId = +request.params.id;
    const user = request.user as { user_id: number };
    const post = await this.postService.findPostById(requestedPostId);

    const isAnotherUser = post.user.id !== user.user_id;

    if (isAnotherUser) {
      throw new ForbiddenException(CANNOT_MODIFY_POST);
    }

    return true;
  }
}
