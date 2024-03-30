import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { User } from '#utils/decorators';
import { ParamIdValidationPipe } from '#utils/pipes';

import { CreateConversationDto } from './dto/createConversation.dto';
import { ConversationService } from './conversation.service';

@ApiTags('Чаты')
@ApiBearerAuth()
@Controller('conversations')
export class CommentController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  getAll(@User() userId: number) {
    return this.conversationService.getConversations(userId);
  }

  @Get(':id')
  getById(@Param('id', ParamIdValidationPipe) userId: number) {
    return this.conversationService.getConversationById(userId);
  }

  @Post()
  create(
    @Body() createConversationDto: CreateConversationDto,
    @User() userId: number,
  ) {
    const conversation = this.conversationService.createConversation({
      ...createConversationDto,
      creatorId: userId,
    });

    return conversation;
  }
}
