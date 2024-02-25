import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const getJWTConfig = async (
  configService: ConfigService,
): Promise<JwtModuleOptions> => {
  console.log(configService.get<string>('JWT_SECRET'));
  return {
    secret: configService.get<string>('JWT_SECRET'),
  };
};
