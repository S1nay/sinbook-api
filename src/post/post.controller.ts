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
import { PostOpenApi } from '#openapi/post.openapi';
import { User } from '#utils/decorators';
import { ParamIdValidationPipe } from '#utils/pipes';

import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {
  CannotDeletePostException,
  CannotModifyPostException,
  PostNotFoundException,
} from './exceptions/post.exceptions';

import { PostService } from './post.service';

@ApiTags('Посты')
@ApiBearerAuth()
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiBody({ type: PostOpenApi.CreatePostDto })
  @ApiOkResponse({ type: PostOpenApi.CreatePostResponse })
  @ApiException(() => [UserNotAuthorizedException])
  @Post()
  create(@Body() createPostDto: CreatePostDto, @User() userId: number) {
    return this.postService.createPost({
      userId,
      ...createPostDto,
    });
  }

  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: PostOpenApi.UpdatePostDto })
  @ApiOkResponse({ type: PostOpenApi.UpdatePostResponse })
  @ApiException(() => [
    UserNotAuthorizedException,
    PostNotFoundException,
    CannotModifyPostException,
  ])
  @Patch(':id')
  update(
    @Param('id', ParamIdValidationPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @User() userId: number,
  ) {
    return this.postService.editPost({
      id,
      userId,
      ...updatePostDto,
    });
  }

  @ApiParam({ name: 'id', type: Number })
  @ApiException(() => [
    UserNotAuthorizedException,
    PostNotFoundException,
    CannotDeletePostException,
  ])
  @Delete(':id')
  delete(
    @Param('id', ParamIdValidationPipe) id: number,
    @User() userId: number,
  ) {
    return this.postService.deletePost({ id, userId });
  }

  @ApiOkResponse({ type: PostOpenApi.FindPosts, isArray: true })
  @ApiException(() => [UserNotAuthorizedException, PostNotFoundException])
  @Get('me')
  findMyPosts(@User() userId: number) {
    return this.postService.findShortUserInfos(userId);
  }

  @ApiOkResponse({ type: PostOpenApi.FindPosts, isArray: true })
  @ApiQuery({ name: 'userId', type: Number })
  @ApiException(() => [UserNotAuthorizedException])
  @Get()
  findPostsByUserId(@Query('userId', ParamIdValidationPipe) userId: number) {
    return this.postService.findShortUserInfos(userId);
  }
}
