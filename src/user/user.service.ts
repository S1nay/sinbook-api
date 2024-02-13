import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SelectUserFields } from './types/user.type';
import { UserResponse } from './responses/user.response';
import { UpdateUserDto } from './dto/update-user.dto';
import { USER_NOT_FOUND } from './constants/user.constants';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  selectUserFields(
    excludedFields?: (keyof SelectUserFields)[],
  ): SelectUserFields {
    const returnedFields = {
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

    if (excludedFields) {
      for (const field of excludedFields) {
        delete returnedFields[field];
      }
    }

    return returnedFields;
  }

  async getMyProfile(userId: number) {
    return this.prismaService.user.findUnique({
      where: { id: userId },
      select: this.selectUserFields(),
    });
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserResponse> {
    return this.prismaService.user.create({
      data: createUserDto,
      select: this.selectUserFields(),
    });
  }

  async findOneById(id: number): Promise<UserResponse> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: this.selectUserFields(['email']),
    });

    if (!user) throw new BadRequestException(USER_NOT_FOUND);

    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
      select: {
        ...this.selectUserFields(),
        passwordHash: true,
      },
    });

    return user;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    await this.findOneById(id);

    return this.prismaService.user.update({
      where: { id },
      data: updateUserDto,
      select: this.selectUserFields(),
    });
  }

  async softDelete(id: number) {
    const user = await this.findOneById(id);

    return this.prismaService.user.update({
      where: { id },
      data: {
        ...user,
        isDeleted: true,
      },
    });
  }
}
