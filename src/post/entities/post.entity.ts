import { ApiHideProperty, ApiProperty, PickType } from '@nestjs/swagger';
import { Post } from '@prisma/client';

import { CommentEntity } from 'src/comment/entities/comment.entity';
import { UserEntity } from 'src/user/entities/user.entity';

export class PostEntity implements Post {
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
  title: string;

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
    type: () =>
      PickType(UserEntity, ['id', 'name', 'secondName', 'middleName']),
  })
  user: UserEntity;

  @ApiHideProperty()
  userId: number;

  @ApiProperty({
    description: 'Комментарии поста',
    type: [CommentEntity],
  })
  comments: CommentEntity[];

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
