import { Module } from '@nestjs/common';

import { UserModule } from '#user/user.module';

import { FollowsController } from './follows.controller';
import { FollowsService } from './follows.service';

@Module({
  imports: [UserModule],
  controllers: [FollowsController],
  providers: [FollowsService],
})
export class FollowsModule {}
