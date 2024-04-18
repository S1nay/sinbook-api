import { Controller, Param, Patch } from '@nestjs/common';

import { User } from '#utils/decorators';
import { ParamIdValidationPipe } from '#utils/pipes';

import { LikeService } from './like.service';

@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Patch(':postId')
  create(
    @Param('postId', ParamIdValidationPipe) postId: number,
    @User() userId: number,
  ) {
    return this.likeService.likePost({ postId, userId });
  }
}
