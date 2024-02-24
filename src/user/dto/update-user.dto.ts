import { CreateUserDto } from './create-user.dto';
import { Prisma } from '@prisma/client';

export class UpdateUserDto
  extends CreateUserDto
  implements Prisma.UserUpdateInput {}
