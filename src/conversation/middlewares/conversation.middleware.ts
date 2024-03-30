import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';

import { HasNoAccessToConversationException } from '#conversation/exceptions/conversation.exceptions';
import { AuthenticatedRequest } from '#utils/interfaces';

import { ConversationService } from '../conversation.service';

export class CheckAccessToConversation implements NestMiddleware {
  constructor(private readonly conversationService: ConversationService) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { id: userId } = req.user;
    const conversationId = parseInt(req.params.id);

    const isHasAccess = await this.conversationService.hasAccess({
      conversationId,
      userId,
    });

    if (isHasAccess) next();
    else throw new HasNoAccessToConversationException();
  }
}
