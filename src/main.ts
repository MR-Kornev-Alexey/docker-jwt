import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { join } from 'path'; // Импортируем функцию join из модуля path
import express from 'express';
import { GetDataSensorService} from './socketClient/getDataSensor.service'; // Импортируем express

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
      'http://localhost',
      '*',
    ],
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    allowedHeaders: ['*'],
  };

  app.enableCors(cors);
  // Создаем новый экземпляр Express
  const expressApp = express();
  // Добавляем обработчик статических файлов для папки uploads
  expressApp.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  // Передаем обработчик статических файлов в Nest
  app.use(expressApp);
  // Инициализация сокет-клиента
  const socketClientService = app.get(GetDataSensorService);
  await socketClientService.sendAndScheduleRequest();

  await app.listen(5000);
}
bootstrap();
