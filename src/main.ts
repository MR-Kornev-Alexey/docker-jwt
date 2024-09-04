import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { join } from 'path';
import express from 'express';
import { GetDataSensorService } from './socketClient/getDataSensor.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER); // Получаем провайдер логгера
  //TODO теперь используется WINSTON для внутреннего логгирования в Nest
  app.useLogger(logger);

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
      'http://localhost:5000',
      'http://80.78.245.91',
      'http://localhost',
      '*',
    ],
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', '*']
  };

  app.enableCors(cors);

  // Serve static files
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  try {
    await app.listen(5000, () => {
      logger.log('info: '+ 'Server running on http://localhost:5000');
    });

    // Start socket client service
    const socketClientService = app.get(GetDataSensorService);
    const callbackFunction = () => {
      try {
        logger.log('info: ' + 'Waiting for the next schedule...');
        setTimeout(async () => {
          try {
            await socketClientService.sendAndScheduleRequest(callbackFunction);
          } catch (error) {
            logger.error('Error in sendAndScheduleRequest inside setTimeout: ' + error);
          }
        }, 10000); // Call the function again in 5 seconds
      } catch (error) {
        logger.error('Error in callbackFunction:', error);
      }
    };
    // Initial call
    logger.log('info: ' + 'Starting socket client service for the first time');
    await socketClientService.sendAndScheduleRequest(callbackFunction);
  } catch (error) {
    logger.error('Error starting server:', error);
  }
}

bootstrap();
