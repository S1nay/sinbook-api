import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { ConversationService } from '#conversation/conversation.service';
import {
  HasNoAccessToConversationException,
  InvalidaConversationIdException,
} from '#conversation/exceptions/conversation.exceptions';

@Injectable()
export class ConversationGuard implements CanActivate {
  constructor(private readonly conversationService: ConversationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const { id: userId } = req.user;
    const conversationId = parseInt(req.params.id);

    if (isNaN(conversationId)) throw new InvalidaConversationIdException();

    const isHasAccess = await this.conversationService.hasAccess({
      conversationId,
      userId,
    });

    if (isHasAccess) return true;
    else throw new HasNoAccessToConversationException();
  }
}
