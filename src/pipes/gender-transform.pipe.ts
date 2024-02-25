import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { Gender } from '@prisma/client';

import { CreateUserDto } from '#user/dto/create-user.dto';

@Injectable()
export class TransformGenderPipe implements PipeTransform {
  transform(value: CreateUserDto, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') return value;

    const transformedValue = value.gender.toUpperCase() as Gender;

    if (![Gender.FEMALE, Gender.MALE].includes(transformedValue))
      throw new BadRequestException(
        'Недопустимое значение gender. Допустимные значения male | female',
      );

    return {
      ...value,
      gender: transformedValue,
    };
  }
}
