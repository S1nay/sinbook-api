import { ApiProperty } from '@nestjs/swagger';

export namespace LikeOpenApi {
  //Create Like Dto
  export class CreateLikeDto {
    @ApiProperty({
      description: 'id поста которому ставится лайк',
      type: Number,
      example: 1,
    })
    postId: number;
  }
}
