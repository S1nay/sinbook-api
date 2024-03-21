import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, verify } from 'jsonwebtoken';

export const WsUser = createParamDecorator((_, ctx: ExecutionContext) => {
  const socket = ctx.switchToWs().getClient();

  const authToken: string =
    socket.handshake.auth?.token ?? socket.handshake.headers?.authorization;

  const [type, token] = authToken.split(' ') ?? [];
  const bearerToken = type === 'Bearer' ? token : undefined;

  const user = verify(
    bearerToken,
    new ConfigService().get('JWT_SECRET'),
  ) as JwtPayload;

  return user.user_id;
});
