import { OmitType } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto
  extends OmitType(CreateUserDto, ['passwordHash'])
  implements Prisma.UserUpdateInput {}
