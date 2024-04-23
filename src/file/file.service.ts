import { Injectable } from '@nestjs/common';
import { path } from 'app-root-path';
import { ensureDir, writeFile } from 'fs-extra';

import { UploadFileDto } from './dto/upload-file.dto';
import { UploadFilesDto } from './dto/upload-files.dto';
import { CreatedFile } from './types/file.types';

@Injectable()
export class FileService {
  private readonly pathUploads: string;

  constructor() {
    this.pathUploads = `${path}/uploads`;
  }

  async uploadFile({ file, dir, host }: UploadFileDto): Promise<CreatedFile> {
    if (!Array.isArray(file)) {
      const uploadFolder = `${this.pathUploads}/${dir}`;

      await ensureDir(uploadFolder);

      await writeFile(`${uploadFolder}/${file.originalname}`, file.buffer);

      const result = {
        url: `${host}/api/${dir}/${file.originalname}`,
        fileName: file.originalname,
      };

      return result;
    }
  }

  async uploadFiles({
    files,
    host,
    dir,
    dirId,
  }: UploadFilesDto): Promise<CreatedFile[]> {
    if (Array.isArray(files)) {
      const uploadFolder = `${this.pathUploads}/${dir}/${dir === 'dialog' ? dirId : ''}`;

      await ensureDir(uploadFolder);

      const uploadedFiles = [];

      for (const file of files) {
        await writeFile(`${uploadFolder}/${file.originalname}`, file.buffer);

        const result = {
          url: `${host}/api/${dir}/${dir === 'dialog' ? dirId : ''}/${file.originalname}`,
          fileName: file.originalname,
        };

        uploadedFiles.push(result);
      }
      return uploadedFiles;
    }
  }
}
