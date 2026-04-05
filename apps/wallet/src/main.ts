import { NestFactory } from '@nestjs/core';
import { WalletModule } from './wallet.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(WalletModule);
  const port = process.env.PORT ?? 3000
  await app.listen(port);
  Logger.log(`Application started on port: [${port}]`)
}
bootstrap();
