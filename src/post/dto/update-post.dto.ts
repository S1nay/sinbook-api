import { PickType } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PostEntity } from '../entities/post.entity';

export class UpdatePostDto extends PickType(PostEntity, [
  'title',
  'images',
  'views',
  'likes',
]) {
  @IsString({ message: 'Поле title должно быть строкой' })
  @IsNotEmpty({ message: 'Поле title не должно быть пустым' })
  title: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  images: string[];

  @IsInt({ message: 'Поле likes должно быть числом' })
  likes: number;

  @IsInt({ message: 'Поле likes должно быть числом' })
  views: number;
}
