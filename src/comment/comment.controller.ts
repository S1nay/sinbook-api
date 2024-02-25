import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { UserNotAuthorizedException } from '#auth/exceptions/auth-exceptions';
import { User } from '#decorators/user.decorator';
import { PostNotFoundException } from '#post/exceptions/post-exceptions';

import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import {
  CannotDeleteCommentException,
  CannotModifyCommentException,
  CommentNotFoundException,
} from './exceptions/comment-exceptions';
import { CommentActionGuard } from './guards/comment-action.guard';
import { CommentOpenApi } from './openapi/comment.openapi';
import { CreateCommentParams } from './params/create-comment.params';
import { DeleteCommentParams } from './params/delete-comment.params';
import { FindPostCommentsParams } from './params/find-post-comments.params';
import { UpdateCommentParams } from './params/update-comment.params';
import { CommentService } from './comment.service';

@ApiTags('Комментарии')
@ApiBearerAuth()
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiParam({ name: 'postId', type: Number })
  @ApiOkResponse({ type: [CommentOpenApi.FindPostCommentsResponse] })
  @ApiException(() => [UserNotAuthorizedException, PostNotFoundException])
  @Get(':postId')
  findAllByPost(@Param() params: FindPostCommentsParams) {
    return this.commentService.findPostComments(+params.postId);
  }

  @ApiBody({ type: CommentOpenApi.CreateCommentDto })
  @ApiOkResponse({ type: CommentOpenApi.CreateCommentResponse })
  @ApiQuery({ name: 'postId', type: Number })
  @ApiException(() => [UserNotAuthorizedException, PostNotFoundException])
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

  @ApiBody({ type: CommentOpenApi.UpdateCommentDto })
  @ApiOkResponse({ type: CommentOpenApi.UpdateCommentResponse })
  @ApiParam({ name: 'id', type: Number })
  @ApiException(() => [
    UserNotAuthorizedException,
    CommentNotFoundException,
    CannotModifyCommentException,
  ])
  @UseGuards(CommentActionGuard)
  @Patch(':id')
  update(
    @Param() params: UpdateCommentParams,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.updateComment({
      id: +params.id,
      updateCommentDto,
    });
  }

  @ApiParam({ name: 'id', type: Number })
  @ApiException(() => [
    UserNotAuthorizedException,
    CommentNotFoundException,
    CannotDeleteCommentException,
  ])
  @UseGuards(CommentActionGuard)
  @Delete(':id')
  delete(@Param() params: DeleteCommentParams) {
    return this.commentService.deleteComment(+params.id);
  }
}
