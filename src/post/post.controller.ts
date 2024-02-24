import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from 'src/decorators/user.decorator';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostActionGuard } from './guards/post-action.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { UserNotAuthorizedException } from 'src/auth/exceptions/auth-exceptions';
import {
  CannotModifyPostException,
  PostNotFoundException,
} from './exceptions/post-exceptions';
import { PostOpenApi } from './openapi/post.openapi';

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

  // @UseGuards(PostActionGuard)
  // @Delete(':id')
  // delete(@Param('id', ParseIntPipe) id: number) {
  //   return this.postService.deletePost(id);
  // }
}
