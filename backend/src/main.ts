import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from './modules/app.module';
import { seed } from './modules/seed/seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();

  const dataSource = app.get(DataSource);
  await seed(dataSource);

  const port = Number(process.env.PORT || 5000);
  await app.listen(port, '0.0.0.0');
  console.log(`Kalimaya API running on :${port}`);
}

bootstrap();
