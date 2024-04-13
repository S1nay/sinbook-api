import { PartialType } from '@nestjs/mapped-types';
import { IsInt } from 'class-validator';

import { CreateMessageDto } from './createMessage.dto';

export class EditMessageDto extends PartialType(CreateMessageDto) {
  @IsInt({ message: 'Поле messageId должно быть числом' })
  messageId: number;
}
