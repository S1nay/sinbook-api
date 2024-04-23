export class UploadFilesDto {
  files: Array<Express.Multer.File>;
  host: string;
  dir: string;
  dirId?: number;
}
