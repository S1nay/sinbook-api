import { OmitType } from '@nestjs/mapped-types';

import { EditMessageDto } from './edit-message.dto';

export class DeleteMessageDto extends OmitType(EditMessageDto, ['content']) {}
