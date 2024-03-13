import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Host = createParamDecorator((_, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return `${request.protocol}://${request.get('Host')}`;
});
