import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const User = createParamDecorator((_, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const userId = request.user.user_id;
  return userId;
});
