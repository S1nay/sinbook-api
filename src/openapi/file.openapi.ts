import { ApiBody, ApiProperty } from '@nestjs/swagger';

export type ApiFileParams = {
  fileName: string;
  isArray?: boolean;
};

export const ApiFile =
  ({ fileName = 'file', isArray = false }: ApiFileParams): MethodDecorator =>
  (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => {
    ApiBody({
      type: 'multipart/form-data',
      required: true,
      schema: isArray
        ? {
            type: 'object',
            properties: {
              [fileName]: {
                type: 'array',
                items: {
                  type: 'string',
                  format: 'binary',
                },
              },
            },
          }
        : {
            type: 'object',
            properties: {
              [fileName]: {
                type: 'string',
                format: 'binary',
              },
            },
          },
    })(target, propertyKey, descriptor);
  };
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
