import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';

import { PaginationParams } from './types';

export const Host = createParamDecorator((_, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return `${request.protocol}://${request.get('Host')}`;
});

export const SkipAuth = (...metadata: string[]) =>
  SetMetadata('skip-auth', metadata);

export const User = createParamDecorator((_, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user.id;
});

export const Pagination = createParamDecorator(
  (_, ctx: ExecutionContext): PaginationParams => {
    const req: Request = ctx.switchToHttp().getRequest();
    if (!req.query.page || !req.query.perPage) return;

    const page = parseInt(req.query.page as string);
    const perPage = parseInt(req.query.perPage as string);
    const search = req.query.search as string;

    if (isNaN(page) || page < 0 || isNaN(perPage) || perPage < 0) {
      throw new BadRequestException('Неверные параметры для пагинации');
    }

    return { page, perPage, search };
  },
);
