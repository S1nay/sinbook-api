import { UseFilters, UsePipes } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { NAMESPACES } from 'adapters/socket.namespaces';

import { SocketSessionManager } from '#core/session.manager';
import { UserService } from '#user/user.service';
import { WebsocketExceptionsFilter } from '#utils/filters';
import { AuthenticatedSocket } from '#utils/interfaces';
import { WSValidationPipe } from '#utils/pipes';

import { CreateNotificationDto } from './dto/create-notification.dto';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { getNotificationData } from './utils/notification.utils';
import { NotificationService } from './notification.service';

@UseFilters(WebsocketExceptionsFilter)
@UsePipes(new WSValidationPipe())
@WebSocketGateway({
  namespace: NAMESPACES.NOTIFICATIONS,
  transports: ['websocket'],
  cors: {
    allowedHeaders: ['Authorization'],
    origin: 'localhost:5173',
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly sessionManager: SocketSessionManager,
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
  ) {}

  async handleConnection(socket: AuthenticatedSocket) {
    console.log(`User ${socket?.user?.nickName} is connected to notifications`);
    this.sessionManager.setUserSocket(socket.user.id, socket);
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    console.log(
      `User ${socket.user.nickName} is disconnected from notifications`,
    );
    this.sessionManager.removeUserSocket(socket.user.id);
  }

  @SubscribeMessage('get_notifications')
  async handleGetNotifications(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() paginationParams: GetNotificationsDto,
  ) {
    const notifications = await this.notificationService.getNotifications({
      paginationParams,
      userId: socket.user.id,
    });

    socket.emit('get_notifications', notifications);
  }

  @SubscribeMessage('read_notifications')
  async handleReadNotifications(
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    await this.notificationService.readNotifications(socket.user.id);
  }

  @OnEvent('create_notification')
  async handleCreateNotification(params: CreateNotificationDto) {
    const { recipientId, type, authorId, typeEntityId } = params;

    const author = await this.userService.findUserById(authorId);

    const notificationData = getNotificationData(type, author);

    const notification = await this.notificationService.createNotification({
      recipientId,
      typeEntityId,
      authorId,
      ...notificationData,
    });

    const recipient = this.sessionManager.getUserSocket(recipientId);

    if (recipient) {
      recipient.emit('new_notification', notification);
    }
  }
}
