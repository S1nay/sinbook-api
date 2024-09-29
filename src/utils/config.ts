import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const getJWTConfig = async (
  configService: ConfigService,
): Promise<JwtModuleOptions> => {
  return {
    secret: configService.get<string>('JWT_SECRET'),
  };
};

export const getNodeEnv = () => {
  switch (process.env.NODE_ENV) {
    case 'staging':
      return '.env.staging';
    case 'development':
      return '.env.development';
    case 'production':
      return '.env.production';
  }
};
