import { Injectable, PipeTransform } from '@nestjs/common';

import {
  FileIsRequiredException,
  InvalidImageTypeException,
  MaxBufferSizeException,
} from '#file/exceptions/file-exceptions';

@Injectable()
export class FileValidatorPipe implements PipeTransform {
  async transform(
    value: Express.Multer.File | Express.Multer.File[],
  ): Promise<Express.Multer.File | Express.Multer.File[]> {
    if (!value || (value as Express.Multer.File[]).length === 0) {
      throw new FileIsRequiredException();
    }

    const files = Array.isArray(value) ? value : [value];

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    const maxFileSize = 1024 * 1024 * 10;

    for (const file of files) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new InvalidImageTypeException();
      }

      if (file.size > maxFileSize) {
        throw new MaxBufferSizeException();
      }
    }

    return value;
  }
}
