import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { Controller, Param, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { UserNotAuthorizedException } from '#auth/exceptions/auth.exceptions';
import { PostNotFoundException } from '#post/exceptions/post.exceptions';
import { User } from '#utils/decorators';
import { ParamIdValidationPipe } from '#utils/pipes';

import { LikeService } from './like.service';

@ApiTags('Лайки')
@ApiBearerAuth()
@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @ApiOkResponse()
  @ApiParam({ name: 'postId', type: Number, example: 1 })
  @ApiException(() => [UserNotAuthorizedException, PostNotFoundException])
  @Patch(':postId')
  create(
    @Param('postId', ParamIdValidationPipe) postId: number,
    @User() userId: number,
  ) {
    return this.likeService.likePost({ postId, userId });
  }
}
