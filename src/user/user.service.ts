import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SelectUserFields } from './types/user.type';
import { UserResponse } from './responses/user.response';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  selectUserFields(): SelectUserFields {
    return {
      id: true,
      email: true,
      name: true,
      secondName: true,
      middleName: true,
      avatarPath: true,
      gender: true,
      city: true,
      birthDate: true,
      isDeleted: true,
    };
  }

  async createUser(createUserDto: CreateUserDto) {
    this.prismaService.user.create({
      data: createUserDto,
    });
  }

  async findOneById(id: number): Promise<UserResponse> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: this.selectUserFields(),
    });

    if (!user) throw new BadRequestException('Пользователь не найден');

    return user;
  }

  async findOneByEmail(email: string): Promise<UserResponse> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
      select: this.selectUserFields(),
    });

    if (!user)
      throw new BadRequestException('Пользователь с таким email не найден');

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOneById(id);

    return this.prismaService.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  // guard на удаление не своего аккаунта
  async softDelete(id: number, user: UserResponse) {
    await this.findOneById(id);

    return this.prismaService.user.update({
      where: { id },
      data: {
        ...user,
        isDeleted: true,
      },
    });
  }
}
