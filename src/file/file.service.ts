import { Injectable } from '@nestjs/common';
import { FileResponse } from './responses/file.response';
import { ensureDir, writeFile } from 'fs-extra';
import { path } from 'app-root-path';
import { UploadFileDto } from './dto/upload-file.dto';

@Injectable()
export class FileService {
  private readonly pathUploads: string;

  constructor() {
    this.pathUploads = `${path}/uploads`;
  }

  async uploadAvatar({ file, userId }: UploadFileDto): Promise<FileResponse> {
    const userFolder = `avatars/${userId}`;
    const uploadFolder = `${this.pathUploads}/${userFolder}`;

    await ensureDir(uploadFolder);

    await writeFile(`${uploadFolder}/${file.originalname}`, file.buffer);

    const result = {
      url: `${userFolder}/${file.originalname}`,
      fileName: file.originalname,
    };

    return result;
  }

  async uploadFiles(files) {
    return files;
  }
}

// posts/postId/files
// avatars/userId/files
// diaglos/dialogId/files
