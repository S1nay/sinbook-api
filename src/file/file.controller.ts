import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import {
  Controller,
  HttpCode,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { ApiFile, FileOpenApi } from '#openapi/file.openapi';
import { Host, SkipAuth } from '#utils/decorators';
import { ParamIdValidationPipe } from '#utils/pipes';

import {
  FileIsRequiredException,
  InvalidImageTypeException,
  MaxBufferSizeException,
} from './exceptions/file.exceptions';
import { FileValidatorPipe } from './pipes/file-validator.pipe';
import { FileService } from './file.service';

@ApiTags('Файлы')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiFile({ fileName: 'avatar' })
  @ApiOkResponse({ type: FileOpenApi.FileResponse })
  @ApiException(() => [
    InvalidImageTypeException,
    MaxBufferSizeException,
    FileIsRequiredException,
  ])
  @SkipAuth()
  @HttpCode(200)
  uploadAvatar(
    @UploadedFile(FileValidatorPipe)
    file: Express.Multer.File,
    @Host() host: string,
  ) {
    return this.fileService.uploadFile({
      host,
      dir: 'avatars',
      file,
    });
  }

  @Post('upload/post')
  @UseInterceptors(FilesInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiFile({ fileName: 'image', isArray: true })
  @ApiOkResponse({ type: FileOpenApi.FileResponse, isArray: true })
  @ApiException(() => [
    InvalidImageTypeException,
    MaxBufferSizeException,
    FileIsRequiredException,
  ])
  @HttpCode(200)
  uploadPostImages(
    @UploadedFiles(FileValidatorPipe)
    files: Express.Multer.File[],
    @Host() host: string,
  ) {
    return this.fileService.uploadFiles({
      host,
      dir: 'post',
      files,
    });
  }

  @Post('upload/dialog')
  @UseInterceptors(FilesInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiFile({ fileName: 'image', isArray: true })
  @ApiOkResponse({ type: FileOpenApi.FileResponse, isArray: true })
  @ApiException(() => [
    InvalidImageTypeException,
    MaxBufferSizeException,
    FileIsRequiredException,
  ])
  @HttpCode(200)
  uploadDialogImages(
    @UploadedFiles(FileValidatorPipe)
    files: Express.Multer.File[],
    @Host() host: string,
    @Query('conversationId', ParamIdValidationPipe) conversationId: number,
  ) {
    return this.fileService.uploadFiles({
      host,
      dir: 'dialog',
      files,
      dirId: conversationId,
    });
  }
}
