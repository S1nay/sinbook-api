import { PickType } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNotEmpty,
  ArrayMaxSize,
  IsArray,
} from 'class-validator';
import { PostEntity } from '../entities/post.entity';

export class CreatePostDto extends PickType(PostEntity, ['title', 'images']) {
  @IsString({ message: 'Поле title должно быть строкой' })
  @IsNotEmpty({ message: 'Поле title не должно быть пустым' })
  title: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  images: string[];
}
