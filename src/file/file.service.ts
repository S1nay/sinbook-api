import { Injectable } from '@nestjs/common';
import { path } from 'app-root-path';
import { randomUUID } from 'crypto';
import { ensureDir, writeFile } from 'fs-extra';
import * as nodePath from 'path';

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
      const uploadFolder = nodePath.join(this.pathUploads, dir);

      await ensureDir(uploadFolder);

      const originalName = nodePath.basename(file.originalname || 'file');
      const ext = nodePath.extname(originalName) || '';
      const fileName = `${randomUUID()}${ext}`;
      const data = file.buffer as unknown as Uint8Array;
      await writeFile(nodePath.join(uploadFolder, fileName), data);

      const result = {
        url: `${host}/api/${dir}/${fileName}`,
        fileName,
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
      const uploadFolder = nodePath.join(
        this.pathUploads,
        dir,
        dir === 'dialog' ? String(dirId) : '',
      );

      await ensureDir(uploadFolder);

      const uploadedFiles = [];

      for (const file of files) {
        const originalName = nodePath.basename(file.originalname || 'file');
        const ext = nodePath.extname(originalName) || '';
        const fileName = `${randomUUID()}${ext}`;
        const data = file.buffer as unknown as Uint8Array;
        await writeFile(nodePath.join(uploadFolder, fileName), data);

        const result = {
          url: `${host}/api/${dir}/${dir === 'dialog' ? dirId : ''}/${fileName}`,
          fileName,
        };

        uploadedFiles.push(result);
      }
      return uploadedFiles;
    }
  }
}
