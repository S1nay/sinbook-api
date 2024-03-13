import { ApiBody } from '@nestjs/swagger';

interface ApiFileParams {
  fileName: string;
  isArray?: boolean;
}

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
