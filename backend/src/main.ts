import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { databaseInit } from './config/databaseInit';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const dataSource = app.get<DataSource>(getDataSourceToken());
  await databaseInit(dataSource);

  const appPort = process.env.BACKEND_PORT ? Number(process.env.BACKEND_PORT) : 3333;
  await app.listen(appPort, '0.0.0.0');
  console.log(`Backend successfully started on port ${appPort}`);
}

bootstrap();
