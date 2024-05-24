// socket.gateway.ts
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({  cors: {
    origin: '*',
  } })
export class SocketGateway {
  @WebSocketServer() server: Server;

  handleConnection(client: any) {
    console.log('Client connected');
  }

  handleDisconnect(client: any) {
    console.log('Client disconnected');
  }

  sendMessage(message: any) {
    console.log('Sending message:', message); // Добавляем логирование перед отправкой сообщения
    this.server.emit('message', message);
  }
}
