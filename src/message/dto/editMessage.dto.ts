import { PartialType } from '@nestjs/mapped-types';

import { CreateMessageDto } from './createMessage.dto';

export class EditMessageDto extends PartialType(CreateMessageDto) {}
