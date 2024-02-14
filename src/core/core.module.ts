import { ServeStaticModule } from '@nestjs/serve-static';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { getJWTConfig } from 'src/config/jwt.config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { path } from 'app-root-path';

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
