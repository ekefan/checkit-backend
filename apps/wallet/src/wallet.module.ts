import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import * as path from 'path';
import { WalletPrismaRepository } from './prisma.repository';
import { IWalletRepository } from './wallet.respository';
import { USER_SERVICE } from './wallet.constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(process.cwd(), 'apps/wallet/.env'),
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    ClientsModule.register([
      {
        name: USER_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: join(process.cwd(), 'proto/user.proto'),
          url: process.env.USER_SERVICE_URL ?? 'localhost:5000',
        },
      },
    ]),
  ],
  controllers: [WalletController],
  providers: [
    WalletService,
    PrismaService,
    {
      provide: IWalletRepository,
      useClass: WalletPrismaRepository,
    },
  ],
})
export class WalletModule {}