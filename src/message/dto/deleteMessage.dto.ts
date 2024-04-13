import { OmitType } from '@nestjs/mapped-types';

import { EditMessageDto } from './editMessage.dto';

export class DeleteMessageDto extends OmitType(EditMessageDto, ['content']) {}
