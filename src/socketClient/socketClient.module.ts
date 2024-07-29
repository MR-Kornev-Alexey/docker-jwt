import { Module } from '@nestjs/common';
import { SocketClientService } from './socketClient.service';
import { GetDataSensorService } from './getDataSensor.service';
import { SocketGateway } from '../web-socket/socket.gateway';
import { SseModule } from '../sse/sse.module';
import { CalculateModule } from '../calculate/calculate.module';
import { CalculateService } from '../calculate/calculate.service';
import { UtilsModule } from '../utils/utils.module';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  providers: [SocketClientService, GetDataSensorService, SocketGateway, CalculateService],
  exports: [SocketClientService, GetDataSensorService],
  imports: [SseModule, CalculateModule, UtilsModule, TelegramModule],
})
export class SocketClientModule {}
