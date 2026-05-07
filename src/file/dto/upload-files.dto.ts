export class UploadFilesDto {
  files: Array<Express.Multer.File>;
  dir: string;
  dirId?: number;
}
