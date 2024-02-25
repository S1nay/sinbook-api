import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiParam,
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
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @User() userId: number,
  ) {
    return this.postService.updatePost(id, updatePostDto, userId);
  }

  @ApiParam({ name: 'id', type: Number })
  @ApiException(() => [
    UserNotAuthorizedException,
    PostNotFoundException,
    CannotDeletePostException,
  ])
  @UseGuards(PostActionGuard)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.postService.deletePost(id);
  }

  @ApiOkResponse({ type: PostOpenApi.FindPosts })
  @ApiException(() => [UserNotAuthorizedException, PostNotFoundException])
  @Get('user/me')
  findMyPosts(@User() userId: number) {
    return this.postService.findUserPosts(userId);
  }

  @ApiOkResponse({ type: PostOpenApi.FindPosts })
  @ApiParam({ name: 'id', type: Number })
  @ApiException(() => [UserNotAuthorizedException])
  @Get('user/:id')
  findPostsByUserId(@Param('id', ParseIntPipe) userId: number) {
    return this.postService.findUserPosts(userId);
  }

  @ApiOkResponse({ type: PostOpenApi.FindPosts })
  @ApiException(() => [UserNotAuthorizedException])
  @Get()
  findPosts() {
    return this.postService.findAllPosts();
  }
}
