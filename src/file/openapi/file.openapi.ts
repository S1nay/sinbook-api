import { ApiProperty } from '@nestjs/swagger';

export namespace FileOpenApi {
  //File Response
  export class FileResponse {
    @ApiProperty({
      description: 'Путь к файлу',
      type: String,
      example: 'http://localhost:5555/api/avatars/1.png',
    })
    url: string;

    @ApiProperty({
      description: 'Имя файла',
      type: String,
      example: '1.png',
    })
    fileName: string;
  }
}
