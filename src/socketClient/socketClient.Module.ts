import { Module } from '@nestjs/common';
import { SocketClientService } from './socketClient.service';
import { GetDataSensorService } from './getDataSensor.service';

@Module({
  providers: [SocketClientService, GetDataSensorService],
  exports: [SocketClientService, GetDataSensorService],
})
export class SocketClientModule {}
