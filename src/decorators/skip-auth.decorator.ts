import { SetMetadata } from '@nestjs/common';

export const SkipAuth = (...metadata: string[]) =>
  SetMetadata('skip-auth', metadata);
