import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(UserModule);
  app.useGlobalPipes(new ValidationPipe());
  const port = process.env.PORT ?? 3000
  await app.listen(port);

  Logger.log(`Application started on port: [${port}]`)
}
bootstrap();
