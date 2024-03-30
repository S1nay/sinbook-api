import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';

export const Host = createParamDecorator((_, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return `${request.protocol}://${request.get('Host')}`;
});

export const SkipAuth = (...metadata: string[]) =>
  SetMetadata('skip-auth', metadata);

export const User = createParamDecorator((_, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user.user_id;
});
