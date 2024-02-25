import { ApiHideProperty, ApiProperty, PickType } from '@nestjs/swagger';
import { Comment } from '@prisma/client';
import { PostOpenApi } from 'src/post/openapi/post.openapi';
import { UserOpenApi } from 'src/user/openapi/user.openapi';

export namespace CommentOneApi {
  //Comment Model
  export class CommentModel implements Comment {
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
      type: PickType(UserOpenApi.UserModel, [
        'id',
        'name',
        'secondName',
        'middleName',
      ]),
    })
    user: () => UserOpenApi.UserModel;

    @ApiHideProperty()
    postId: number;

    @ApiHideProperty()
    post: () => PostOpenApi.PostModel;

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
}
