import { PartialType } from '@nestjs/mapped-types';

import { CreateMessageDto } from './createMessage.dto';

export class UpdateMessageDto extends PartialType(CreateMessageDto) {}
