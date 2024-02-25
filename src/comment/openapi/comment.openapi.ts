import {
  ApiHideProperty,
  ApiProperty,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { Comment } from '@prisma/client';

import { PostOpenApi } from '#post/openapi/post.openapi';
import { UserOpenApi } from '#user/openapi/user.openapi';

export namespace CommentOpenApi {
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
  //Get All Post Comments Response
  export class FindPostCommentsResponse extends OmitType(CommentModel, [
    'postId',
    'userId',
  ]) {}

  //Create Comment Response
  export class CreateCommentResponse extends OmitType(CommentModel, [
    'postId',
    'userId',
  ]) {}

  //Update Comment Response
  export class UpdateCommentResponse extends OmitType(CommentModel, [
    'postId',
    'userId',
  ]) {}

  //Create Comment Dto
  export class CreateCommentDto extends PickType(CommentModel, ['content']) {}

  //Update Comment Dto
  export class UpdateCommentDto extends PickType(CommentModel, ['content']) {}
}
