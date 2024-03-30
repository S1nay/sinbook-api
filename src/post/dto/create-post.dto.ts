import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePostDto {
  @IsString({ message: 'Поле title должно быть строкой' })
  @IsNotEmpty({ message: 'Поле title не должно быть пустым' })
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  images: string[];
}
