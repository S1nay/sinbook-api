import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ValidationError } from 'class-validator';

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

@Injectable()
export class FieldsValidationPipe extends ValidationPipe {
  createExceptionFactory() {
    return function (validationErrors: ValidationError[] = []) {
      return new BadRequestException(
        validationErrors.map((error) => ({
          field: error.property,
          error: Object.values(error.constraints).join(', '),
        })),
      );
    };
  }
}
