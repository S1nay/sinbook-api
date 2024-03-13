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

import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {
  CannotDeletePostException,
  CannotModifyPostException,
  PostNotFoundException,
} from './exceptions/post-exceptions';
import { PostActionGuard } from './guards/post-action.guard';
import { PostOpenApi } from './openapi/post.openapi';
import { DeletePostParams } from './params/delete-post.params';
import { FindPostByUserIdParams } from './params/find-post-by-userId.params';
import { UpdatePostParams } from './params/update-post.params';
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
    return this.postService.createPost(createPostDto, userId);
  }

  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: PostOpenApi.UpdatePostDto })
  @ApiOkResponse({ type: PostOpenApi.UpdatePostResponse })
  @ApiException(() => [
    UserNotAuthorizedException,
    PostNotFoundException,
    CannotModifyPostException,
  ])
  @UseGuards(PostActionGuard)
  @Patch(':id')
  update(
    @Param() params: UpdatePostParams,
    @Body() updatePostDto: UpdatePostDto,
    @User() userId: number,
  ) {
    return this.postService.updatePost(+params.id, updatePostDto, userId);
  }

  @ApiParam({ name: 'id', type: Number })
  @ApiException(() => [
    UserNotAuthorizedException,
    PostNotFoundException,
    CannotDeletePostException,
  ])
  @UseGuards(PostActionGuard)
  @Delete(':id')
  delete(@Param() params: DeletePostParams) {
    return this.postService.deletePost(+params.id);
  }

  @ApiOkResponse({ type: PostOpenApi.FindPosts, isArray: true })
  @ApiException(() => [UserNotAuthorizedException, PostNotFoundException])
  @Get('me')
  findMyPosts(@User() userId: number) {
    return this.postService.findUserPosts(userId);
  }

  @ApiOkResponse({ type: PostOpenApi.FindPosts, isArray: true })
  @ApiQuery({ name: 'userId', type: Number })
  @ApiException(() => [UserNotAuthorizedException])
  @Get()
  findPostsByUserId(@Query() params: FindPostByUserIdParams) {
    return this.postService.findUserPosts(+params.userId);
  }
}
