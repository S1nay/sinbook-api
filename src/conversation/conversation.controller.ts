import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { PrismaService } from '#prisma/prisma.service';
import { User } from '#utils/decorators';
import { ParamIdValidationPipe } from '#utils/pipes';

import { CreateConversationDto } from './dto/createConversation.dto';
import { ConversationGuard } from './guards/conversation.guard';
import { ConversationService } from './conversation.service';

@ApiTags('Чаты')
@ApiBearerAuth()
@Controller('conversations')
export class ConversationController {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly eventsEmmiter: EventEmitter2,
    private readonly prismaService: PrismaService,
  ) {}

  @Get()
  getAll(@User() userId: number) {
    return this.conversationService.getConversations(userId);
  }

  @UseGuards(ConversationGuard)
  @Get(':id')
  getById(@Param('id', ParamIdValidationPipe) conversationId: number) {
    return this.conversationService.getConversationById({ conversationId });
  }

  @Post()
  async create(
    @Body() createConversationDto: CreateConversationDto,
    @User() userId: number,
  ) {
    const conversation = await this.conversationService.createConversation({
      ...createConversationDto,
      creatorId: userId,
    });

    this.eventsEmmiter.emit('create.conversation', conversation);

    return conversation;
  }
}
