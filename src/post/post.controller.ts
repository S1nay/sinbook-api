import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  ParseIntPipe,
  Get,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from 'src/decorators/user.decorator';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostActionGuard } from './guards/post-action.guard';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto, @User() userId: number) {
    return this.postService.createPost(createPostDto, userId);
  }

  // @Get()
  // findAll() {
  //   return this.postService.findAll();
  // }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postService.findPostById(id);
  }

  @UseGuards(PostActionGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @User() userId: number,
  ) {
    return this.postService.updatePost(id, updatePostDto, userId);
  }

  @UseGuards(PostActionGuard)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.postService.deletePost(id);
  }
}
