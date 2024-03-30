import {
  ApiHideProperty,
  ApiProperty,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { Post } from '@prisma/client';

import { CommentOpenApi } from './comment.openapi';
import { UserOpenApi } from './user.openapi';

export namespace PostOpenApi {
  // Count Fields of Post
  export class PostModelCountFields {
    @ApiProperty({
      description: 'Кол-во комментариев у поста',
      example: 1,
      type: Number,
    })
    commentsCount?: number;
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
      description: 'Кол-во просмотров у поста',
      example: 12,
      type: Number,
    })
    views: number;

    @ApiProperty({
      description: 'Кол-во лайков у поста',
      example: 12,
      type: Number,
    })
    likes: number;

    @ApiProperty({
      description: 'Картинки к посту',
      example: ['http://localhost:5555/api/static/post/1/image.png'],
      type: [String],
      maxItems: 10,
    })
    images: string[];

    @ApiProperty({
      description: 'Автор поста',
      type: PickType(UserOpenApi.UserModel, [
        'id',
        'name',
        'secondName',
        'middleName',
      ]),
    })
    user: () => UserOpenApi.UserModel;

    @ApiHideProperty()
    userId: number;

    @ApiProperty({
      description: 'Комментарии поста',
      type: [CommentOpenApi.CommentModel],
    })
    comments: () => CommentOpenApi.CommentModel[];

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
    'views',
    'likes',
  ]) {}

  //Create Post Response
  export class CreatePostResponse extends OmitType(PostModel, ['comments']) {}

  //Update Post Response
  export class UpdatePostResponse extends OmitType(PostModel, ['comments']) {}

  //Get Posts (All, User, My)
  export class FindPosts extends OmitType(PostModel, ['comments']) {}
}
