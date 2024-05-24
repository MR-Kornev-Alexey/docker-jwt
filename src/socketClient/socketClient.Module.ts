import { Module } from '@nestjs/common';
import { SocketClientService } from './socketClient.service';
import { GetDataSensorService } from './getDataSensor.service';
import { SocketGateway } from '../web-socket/socket.gateway';
import { SseModule } from '../sse/sse.module';

@Module({
  providers: [SocketClientService, GetDataSensorService, SocketGateway],
  exports: [SocketClientService, GetDataSensorService],
  imports: [SseModule],
})
export class SocketClientModule {}
