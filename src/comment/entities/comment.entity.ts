import { ApiHideProperty, ApiProperty, PickType } from '@nestjs/swagger';
import { Comment } from '@prisma/client';
import { PostEntity } from 'src/post/entities/post.entity';
import { UserEntity } from 'src/user/entities/user.entity';

export class CommentEntity implements Comment {
  @ApiProperty({
    description: 'Id комментария',
    example: 1,
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'Текст комментария',
    example: 'Это комментарий',
    type: String,
  })
  content: string;

  @ApiHideProperty()
  userId: number;

  @ApiProperty({
    description: 'Автор комментария',
    type: () =>
      PickType(UserEntity, ['id', 'name', 'secondName', 'middleName']),
  })
  user: UserEntity;

  @ApiHideProperty()
  postId: number;

  @ApiHideProperty()
  post: PostEntity;

  @ApiProperty({
    description: 'Дата создания комментария',
    example: '2024-02-13T14:50:43.867Z',
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Дата обновления комментария',
    example: '2024-02-13T14:50:43.867Z',
    type: Date,
  })
  updatedAt: Date;
}
