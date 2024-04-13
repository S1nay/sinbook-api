import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePostDto {
  @IsString({ message: 'Поле content должно быть строкой' })
  @IsNotEmpty({ message: 'Поле content не должно быть пустым' })
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  images: string[];
}
