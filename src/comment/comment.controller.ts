import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { User } from '#decorators/user.decorator';

import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentOpenApi } from './openapi/comment.openapi';
import { CreateCommentParams } from './params/create-comment.params';
import { FindPostCommentsParams } from './params/find-post-comments.params';
import { CommentService } from './comment.service';

@ApiTags('Комментарии')
@ApiBearerAuth()
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiParam({ name: 'postId', type: Number })
  @ApiResponse({ type: [CommentOpenApi.FindPostCommentsResponse] })
  @Get(':postId')
  findAllByPost(@Param() params: FindPostCommentsParams) {
    return this.commentService.findPostComments(+params.postId);
  }

  @ApiBody({ type: CommentOpenApi.CreateCommentDto })
  @ApiResponse({ type: CommentOpenApi.CreateCommentResponse })
  @ApiQuery({ name: 'postId', type: Number })
  @Post()
  create(
    @Query() params: CreateCommentParams,
    @User() userId: number,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentService.createComment({
      postId: +params.postId,
      userId,
      createCommentDto,
    });
  }
}
