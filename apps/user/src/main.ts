import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { UserModule } from './user.module';
import { join } from 'path';
import { Logger } from '@nestjs/common';
import { ReflectionService } from '@grpc/reflection';
import { GrpcExceptionFilter } from './user.validator';
import * as protoLoader from '@grpc/proto-loader';

async function bootstrap() {
  const port = process.env.PORT ?? 5000;

  const packageDef = protoLoader.loadSync(
    join(process.cwd(), 'proto/user.proto'),
  );
  const reflection = new ReflectionService(packageDef);
  
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UserModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'user',
        protoPath: join(process.cwd(), 'proto/user.proto'),
        url: `0.0.0.0:${port}`,
        onLoadPackageDefinition: (pkg, server) => {
          reflection.addToServer(server);
        },
      },
    },
  );

  app.useGlobalFilters(new GrpcExceptionFilter());  
  await app.listen();
  Logger.log(`User gRPC service running on port: ${port}`);
}
bootstrap();