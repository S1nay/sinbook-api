import { User } from '@prisma/client';
import { Request } from 'express';
import { Socket } from 'socket.io';

import { TokenInfo } from './types';

export interface AuthenticatedRequest extends Request {
  user: User;
}

export interface AuthenticatedSocket extends Socket {
  user?: TokenInfo;
  conversationId?: number;
}
