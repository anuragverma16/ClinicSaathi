import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class QueueGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('updateQueueStatus')
  handleQueueUpdate(@MessageBody() data: { appointmentId: string; status: string }) {
    // Broadcast status change to all connected clients
    this.server.emit('queueUpdated', data);
    return { event: 'queueUpdated', data };
  }
}