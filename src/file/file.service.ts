import { Inject, Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

import { CLOUDINARY } from '#core/cloudinary.provider';

import { UploadFileDto } from './dto/upload-file.dto';
import { UploadFilesDto } from './dto/upload-files.dto';
import { CreatedFile } from './types/file.types';

type CloudinaryInstance = typeof cloudinary;

@Injectable()
export class FileService {
  private readonly pathUploads: string;
  private readonly host: string;

  constructor(
    @Inject(CLOUDINARY) private readonly cloudinary: CloudinaryInstance,
  ) {}

  private uploadToCloudinary(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async uploadFile({ file, dir }: UploadFileDto): Promise<CreatedFile> {
    const result = await this.uploadToCloudinary(file, dir);

    return {
      url: result.secure_url,
      fileName: result.public_id.split('/').pop(),
    };
  }

  async uploadFiles({
    files,
    dir,
    dirId,
  }: UploadFilesDto): Promise<CreatedFile[]> {
    const folder = dir === 'dialog' && dirId ? `${dir}/${dirId}` : dir;

    const results = await Promise.all(
      files.map((file) => this.uploadToCloudinary(file, folder)),
    );

    return results.map((result) => ({
      url: result.secure_url,
      fileName: result.public_id.split('/').pop(),
    }));
  }
}
