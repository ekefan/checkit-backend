import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { WalletModule } from './wallet.module';
import { join } from 'path';
import { Logger } from '@nestjs/common';
import { ReflectionService } from '@grpc/reflection';
import * as protoLoader from '@grpc/proto-loader';
import { GrpcExceptionFilter } from './wallet.validator';

async function bootstrap() {
  const port = process.env.PORT ?? 5001;

  const packageDef = protoLoader.loadSync(
    join(process.cwd(), 'proto/wallet.proto'),
  );
  const reflection = new ReflectionService(packageDef);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    WalletModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'wallet',
        protoPath: join(process.cwd(), 'proto/wallet.proto'),
        url: `0.0.0.0:${port}`,
        onLoadPackageDefinition: (pkg, server) => {
          reflection.addToServer(server);
        },
      },
    },
  );
  app.useGlobalFilters(new GrpcExceptionFilter());  
  await app.listen();
  Logger.log(`Wallet gRPC service running on port: ${port}`);
}
bootstrap();