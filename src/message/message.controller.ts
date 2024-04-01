import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { User } from '#utils/decorators';
import { ParamIdValidationPipe } from '#utils/pipes';

import { CreateMessageDto } from './dto/createMessage.dto';
import { EditMessageDto } from './dto/editMessage.dto';
import { MessageService } from './message.service';

@ApiTags('Сообщения')
@Controller('conversation/:id/messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

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

    return { message, conversation };
  }

  // @Get()
  // async getAll(
  //   @User() userId: number,
  //   @Param('id', ParamIdValidationPipe) id: number,
  // ) {
  //   return this.messageService.getMessages(id);
  // }

  @Delete(':messageId')
  async delete(
    @User() userId: number,
    @Param('id', ParamIdValidationPipe) conversationId: number,
    @Param('messageId', ParamIdValidationPipe) messageId: number,
  ) {
    const params = { userId, conversationId, messageId };

    await this.messageService.deleteMessage(params);

    return { conversationId, messageId };
  }

  @Patch(':messageId')
  async update(
    @User() userId: number,
    @Param('id', ParamIdValidationPipe) conversationId: number,
    @Param('messageId', ParamIdValidationPipe) messageId: number,
    @Body() { content }: EditMessageDto,
  ) {
    const params = { userId, content, conversationId, messageId };

    const message = await this.messageService.editMessage(params);

    return message;
  }
}
