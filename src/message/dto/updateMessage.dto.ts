import { PartialType } from '@nestjs/mapped-types';
import { IsInt } from 'class-validator';

import { CreateMessageDto } from './createMessage.dto';

export class UpdateMessageDto extends PartialType(CreateMessageDto) {
  @IsInt({ message: 'Поле recipientId должно быть числом' })
  messageId?: number;
}
