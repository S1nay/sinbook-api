import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [CoreModule, UserModule, AuthModule, PostModule],
})
export class AppModule {}
