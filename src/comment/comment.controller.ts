import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { UserNotAuthorizedException } from '#auth/exceptions/auth.exceptions';
import { PostNotFoundException } from '#post/exceptions/post.exceptions';
import { Pagination, User } from '#utils/decorators';
import { ParamIdValidationPipe } from '#utils/pipes';
import { PaginationParams } from '#utils/types';

import { CommentOpenApi } from '../openapi/comment.openapi';

import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import {
  CannotDeleteCommentException,
  CannotModifyCommentException,
  CommentNotFoundException,
} from './exceptions/comment.exceptions';
import { CommentService } from './comment.service';

@ApiTags('Комментарии')
@ApiBearerAuth()
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiQuery({ name: 'postId', type: Number })
  @ApiOkResponse({ type: CommentOpenApi.FindAllCommentsByPost })
  @ApiQuery({ type: Number, example: 1, name: 'page', required: false })
  @ApiQuery({
    type: Number,
    example: 15,
    name: 'perPage',
    required: false,
  })
  @ApiException(() => [UserNotAuthorizedException, PostNotFoundException])
  @Get()
  findAllByPost(
    @Query('postId', ParamIdValidationPipe) postId: number,
    @Pagination() params: PaginationParams,
  ) {
    return this.commentService.findPostComments({
      paginationParams: { ...params },
      postId,
    });
  }

  @ApiBody({ type: CommentOpenApi.CreateCommentDto })
  @ApiOkResponse({ type: CommentOpenApi.CreateCommentResponse })
  @ApiQuery({ name: 'postId', type: Number })
  @ApiException(() => [UserNotAuthorizedException, PostNotFoundException])
  @Post()
  create(
    @Query('postId', ParamIdValidationPipe) postId: number,
    @User() userId: number,
    @Body() { content }: CreateCommentDto,
  ) {
    return this.commentService.createComment({
      postId,
      userId,
      content,
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
  @Patch(':id')
  edit(
    @Query('id', ParamIdValidationPipe) id: number,
    @Body() { content }: UpdateCommentDto,
    @User() userId: number,
  ) {
    return this.commentService.editComment({
      id,
      content,
      userId,
    });
  }

  @ApiOkResponse()
  @ApiParam({ name: 'id', type: Number })
  @ApiException(() => [
    UserNotAuthorizedException,
    CommentNotFoundException,
    CannotDeleteCommentException,
  ])
  @Delete(':id')
  delete(
    @Query('id', ParamIdValidationPipe) id: number,
    @User() userId: number,
  ) {
    return this.commentService.deleteComment({ id, userId });
  }
}
