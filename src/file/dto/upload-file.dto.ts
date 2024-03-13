export class UploadFileDto {
  file: Express.Multer.File;
  host: string;
  dir: string;
}
