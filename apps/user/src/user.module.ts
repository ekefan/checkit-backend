import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { IUserRepository } from './user.repository';
import { UserPrismaRepository } from './prisma.repository';
import { WALLET_SERVICE } from './user.constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), 'apps/user/.env'),
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    ClientsModule.register([
      {
        name: WALLET_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: 'wallet',
          protoPath: join(process.cwd(), 'proto/wallet.proto'),
          url: process.env.WALLET_SERVICE_URL ?? 'localhost:5001',
        },
      },
    ]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    PrismaService,
    {
      provide: IUserRepository,
      useClass: UserPrismaRepository,
    },
  ],
})
export class UserModule {}