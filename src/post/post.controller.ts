import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  ParseIntPipe,
  Get,
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
import {
  CreatePostResponse,
  UpdatePostResponse,
} from './responses/post.responses';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { UserNotAuthorizedException } from 'src/auth/exceptions/auth-exceptions';
import {
  CannotModifyPostException,
  PostNotFoundException,
} from './exceptions/post-exceptions';

@ApiTags('Посты')
@ApiBearerAuth()
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiBody({ type: CreatePostDto })
  @ApiOkResponse({ type: CreatePostResponse })
  @ApiException(() => [UserNotAuthorizedException])
  @Post()
  create(@Body() createPostDto: CreatePostDto, @User() userId: number) {
    return this.postService.createPost(createPostDto, userId);
  }

  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: CreatePostResponse })
  @ApiException(() => [UserNotAuthorizedException, PostNotFoundException])
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postService.findPostById(id);
  }

  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdatePostDto })
  @ApiOkResponse({ type: UpdatePostResponse })
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
