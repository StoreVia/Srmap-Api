import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { WS_PORT } from './config/constants';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(WS_PORT);
}

bootstrap();