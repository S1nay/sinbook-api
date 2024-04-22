import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Gender } from '@prisma/client';
import { ValidationError } from 'class-validator';

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

@Injectable()
export class WSValidationPipe extends ValidationPipe {
  createExceptionFactory() {
    return function (validationErrors: ValidationError[] = []) {
      const errors = this.flattenValidationErrors(validationErrors);

      return new WsException(errors);
    };
  }
}

@Injectable()
export class ParamIdValidationPipe implements PipeTransform {
  async transform(value: string) {
    const transformedValue = +value;

    if (typeof transformedValue !== 'number') {
      throw new BadRequestException('id должен быть числом');
    }

    if (transformedValue <= 0) {
      throw new BadRequestException('id должен быть положительным числом');
    }

    return transformedValue;
  }
}

@Injectable()
export class ParamBoolValidationPipe implements PipeTransform {
  async transform(value: string) {
    const transformedValue = Boolean(value);

    if (typeof transformedValue !== 'boolean') {
      throw new BadRequestException(
        `Параметр ${value} должен быть булевым значением `,
      );
    }

    return transformedValue;
  }
}
