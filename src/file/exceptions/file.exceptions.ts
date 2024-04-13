import {
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';

import {
  FILE_IS_REQUIRED,
  INVALID_IMAGE_TYPE,
  MAX_BUFFER_SIZE,
} from '#file/constants/file.constants';

export class InvalidImageTypeException extends UnprocessableEntityException {
  constructor() {
    super(INVALID_IMAGE_TYPE);
  }
}

export class MaxBufferSizeException extends UnprocessableEntityException {
  constructor() {
    super(MAX_BUFFER_SIZE);
  }
}

export class FileIsRequiredException extends BadRequestException {
  constructor() {
    super(FILE_IS_REQUIRED);
  }
}
