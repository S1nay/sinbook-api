import { Module } from '@nestjs/common';

import { UserModule } from '#user/user.module';

import { NotificationsGateway } from './notification.gateway';
import { NotificationService } from './notification.service';

@Module({
  imports: [UserModule],
  providers: [NotificationService, NotificationsGateway],
})
export class NotificationModule {}
