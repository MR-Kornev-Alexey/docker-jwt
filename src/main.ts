import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { join } from 'path';
import express from 'express';
import { GetDataSensorService } from './socketClient/getDataSensor.service';

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

  // Initialize socket client service
  const socketClientService = app.get(GetDataSensorService);
  await socketClientService.startSchedule();


  await app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
  });
}

bootstrap();
