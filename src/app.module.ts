import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { path } from 'app-root-path';
import { PostModule } from './post/post.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: `${path}/uploads`,
      serveRoot: '/static/',
    }),
    UserModule,
    AuthModule,
    PostModule,
  ],
})
export class AppModule {}
