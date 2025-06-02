import {
  ApiHideProperty,
  ApiProperty,
  OmitType,
  PickType,
} from '@nestjs/swagger';

import { Post } from '#utils/types';

import { CommentOpenApi } from './comment.openapi';
import { Pagination } from './pagination.openapi';
import { UserOpenApi } from './user.openapi';

export namespace PostOpenApi {
  // Count Fields of Post
  export class PostModelCountFields {
    @ApiProperty({
      description: 'Кол-во комментариев у поста',
      example: 1,
      type: Number,
    })
    commentsCount: number;
  }

  //Post Model
  export class PostModel extends PostModelCountFields implements Post {
    @ApiProperty({
      description: 'Id поста',
      example: 1,
      type: Number,
    })
    id: number;

    @ApiProperty({
      description: 'Название поста',
      example: 'title',
      type: String,
    })
    content: string;

    @ApiProperty({
      description: 'Массив с id юзеров которые поставили лайк',
      example: [1, 2, 3],
      type: [Number],
    })
    likes: number[];

    @ApiProperty({
      description: 'Картинки к посту',
      example: ['http://localhost:5555/api/static/post/1/image.png'],
      type: [String],
      maxItems: 10,
    })
    images: string[];

    @ApiProperty({
      description: 'Автор поста',
      type: UserOpenApi.ShortUser,
    })
    user: UserOpenApi.ShortUser;

    @ApiHideProperty()
    userId: number;

    @ApiHideProperty()
    comments: [CommentOpenApi.CommentModel];

    @ApiProperty({
      description: 'Дата обновления поста',
      example: '2024-02-13T14:50:43.867Z',
      type: Date,
    })
    updatedAt: Date;

    @ApiProperty({
      description: 'Дата создания поста',
      example: '2024-02-13T14:50:43.867Z',
      type: Date,
    })
    createdAt: Date;
  }

  //Create Post Dto
  export class CreatePostDto extends PickType(PostModel, [
    'content',
    'images',
  ]) {}

  //Update Post Dto
  export class UpdatePostDto extends PickType(PostModel, [
    'content',
    'images',
  ]) {}

  //Create Post Response
  export class CreatePostResponse extends OmitType(PostModel, ['comments']) {}

  //Update Post Response
  export class UpdatePostResponse extends OmitType(PostModel, ['comments']) {}

  //Find Posts (All, User, My)
  export class FindAllPosts {
    @ApiProperty({
      description: 'Посты',
      type: PostModel,
      isArray: true,
    })
    results: () => PostModel[];

    @ApiProperty({
      description: 'Мета пагинации',
      type: Pagination.PaginationMeta,
    })
    meta: () => Pagination.PaginationMeta;
  }
}
