import { Module } from '@nestjs/common';
import { SocketClientService } from './socketClient.service';
import { GetDataSensorService } from './getDataSensor.service';
import { SocketGateway } from '../web-socket/socket.gateway';
import { SseModule } from '../sse/sse.module';
import { CalculateModule } from '../calculate/calculate.module';
import { CalculateService } from '../calculate/calculate.service';

@Module({
  providers: [SocketClientService, GetDataSensorService, SocketGateway, CalculateService],
  exports: [SocketClientService, GetDataSensorService],
  imports: [SseModule, CalculateModule],
})
export class SocketClientModule {}
