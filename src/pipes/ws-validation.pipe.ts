import { Injectable, ValidationPipe } from '@nestjs/common';
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
