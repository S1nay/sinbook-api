import {
  Controller,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/guards/jwt-guard';
import { User } from 'src/decorators/user.decorator';
import { UploadFileDto } from './dto/upload-file.dto';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  uploadAvatar(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /\.jpeg|jpg|png|webp|gif/,
        })
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 10,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: UploadFileDto['file'],
    @User() userId: number,
  ) {
    return this.fileService.uploadAvatar({
      file,
      userId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload/files')
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: {
        files: 10,
      },
    }),
  )
  uploadFile(
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 10,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    files: Array<UploadFileDto['file']>,
  ) {
    return this.fileService.uploadFiles(files);
  }
}
