import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { path } from 'app-root-path';

import { PrismaModule } from '#prisma/prisma.module';
import { getJWTConfig } from '#utils/config';

import { SocketSessionManager } from './session.manager';

@Global()
@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'development'
          ? '.env.development'
          : '.env.production',
    }),
    ServeStaticModule.forRoot({
      rootPath: `${path}/uploads`,
      serveRoot: '/api',
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: getJWTConfig,
    }),
    EventEmitterModule.forRoot(),
  ],
  providers: [SocketSessionManager],
  exports: [JwtModule, ConfigModule, PrismaModule, SocketSessionManager],
})
export class CoreModule {}
