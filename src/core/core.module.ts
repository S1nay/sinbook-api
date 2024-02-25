import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { path } from 'app-root-path';

import { getJWTConfig } from '#config/jwt.config';
import { PrismaModule } from '#prisma/prisma.module';

@Global()
@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: `${path}/uploads`,
      serveRoot: '/static/',
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: getJWTConfig,
    }),
  ],
  exports: [JwtModule, ConfigModule, PrismaModule],
})
export class CoreModule {}
