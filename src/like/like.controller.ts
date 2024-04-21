import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UserNotAuthorizedException } from '#auth/exceptions/auth.exceptions';
import { PostOpenApi } from '#openapi/post.openapi';
import { PostNotFoundException } from '#post/exceptions/post.exceptions';
import { User } from '#utils/decorators';

import { CreateLikeDto } from './dto/create-like.dto';
import { LikeService } from './like.service';

@ApiTags('Лайки')
@ApiBearerAuth()
@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @ApiOkResponse({ type: PostOpenApi.CreatePostResponse })
  @ApiBody({ type: CreateLikeDto })
  @ApiException(() => [UserNotAuthorizedException, PostNotFoundException])
  @Post()
  async create(@Body() { postId }: CreateLikeDto, @User() userId: number) {
    return this.likeService.likePost({ postId, userId });
  }
}
