import { Prisma } from '@prisma/client';

import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto
  extends CreateUserDto
  implements Prisma.UserUpdateInput {}
