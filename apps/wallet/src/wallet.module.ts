import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from "./prisma.service"; 
import * as path from 'path';
import { WalletPrismaRepository } from './prisma.repository';
import { IWalletRepository } from './wallet.respository';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(process.cwd(), 'apps/wallet/.env'),
      ignoreEnvFile: process.env.NODE_ENV === 'production'
    })
  ],
  controllers: [WalletController],
  providers: [
    WalletService,
    PrismaService,
    {
      provide: IWalletRepository,
      useClass: WalletPrismaRepository
    }
    ],
})
export class WalletModule {}
