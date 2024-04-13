import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiTags } from '@nestjs/swagger';

import { ConversationGuard } from '#conversation/guards/conversation.guard';
import { User } from '#utils/decorators';
import { ParamIdValidationPipe } from '#utils/pipes';

import { CreateMessageDto } from './dto/createMessage.dto';
import { EditMessageDto } from './dto/editMessage.dto';
import { MessageService } from './message.service';

@ApiTags('Сообщения')
@UseGuards(ConversationGuard)
@Controller('conversation/:id/messages')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly eventsEmmiter: EventEmitter2,
  ) {}

  @Post()
  async create(
    @Body() { content }: CreateMessageDto,
    @User() userId: number,
    @Param('id', ParamIdValidationPipe) conversationId: number,
  ) {
    const { message, conversation } = await this.messageService.createMessage({
      userId,
      content,
      conversationId,
    });

    this.eventsEmmiter.emit('create.message', { message, conversation });

    return;
  }

  @Get()
  async getAll(@Param('id', ParamIdValidationPipe) id: number) {
    return this.messageService.getConversationMessages(id);
  }

  @Delete(':messageId')
  async delete(
    @User() userId: number,
    @Param('id', ParamIdValidationPipe) conversationId: number,
    @Param('messageId', ParamIdValidationPipe) messageId: number,
  ) {
    const params = { userId, conversationId, messageId };

    const payload = await this.messageService.deleteMessage(params);

    this.eventsEmmiter.emit('delete.message', {
      message: payload.message,
      conversation: payload.conversation,
    });

    return payload.message;
  }

  @Patch(':messageId')
  async update(
    @User() userId: number,
    @Param('id', ParamIdValidationPipe) conversationId: number,
    @Param('messageId', ParamIdValidationPipe) messageId: number,
    @Body() { content }: EditMessageDto,
  ) {
    const params = { userId, content, conversationId, messageId };

    const payload = await this.messageService.editMessage(params);

    if ('message' in payload) {
      this.eventsEmmiter.emit('edit.message', {
        message: payload.message,
        conversation: payload.conversation,
      });

      return payload.message;
    } else {
      this.eventsEmmiter.emit('edit.message', {
        message: payload,
      });

      return payload;
    }
  }
}
