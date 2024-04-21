import { PartialType } from '@nestjs/mapped-types';
import { IsInt } from 'class-validator';

import { CreateMessageDto } from './create-message.dto';

export class EditMessageDto extends PartialType(CreateMessageDto) {
  @IsInt({ message: 'Поле messageId должно быть числом' })
  messageId: number;
}
