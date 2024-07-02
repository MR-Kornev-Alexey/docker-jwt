import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { join } from 'path';
import express from 'express';
import { GetDataSensorService } from './socketClient/getDataSensor.service';
import cron from 'node-cron';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Open API Nest JWT')
    .setDescription('API Nest JWT')
    .setVersion('1.0')
    .addTag('Nest JWT')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('openapi', app, document);


  const cors = {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5000',
      'http://localhost',
      '*',
    ],
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    allowedHeaders: ['*']
  };

  app.enableCors(cors);

  // Serve static files
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  const socketClientService = app.get(GetDataSensorService);
  // cron.schedule('*/10 * * * * *', async () => {
  //       console.log("Start new cycle - ", new Date());
  //       await socketClientService.sendAndScheduleRequest();
  // });
  const callbackFunction = () => {
    console.log('Waiting for the next schedule...');
    setTimeout(() => {
      socketClientService.sendAndScheduleRequest(callbackFunction);
    }, 5000); // Вызываем функцию повторно через 5 секунд
  };
  await socketClientService.sendAndScheduleRequest(callbackFunction);
  await app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
  });
}

bootstrap();
