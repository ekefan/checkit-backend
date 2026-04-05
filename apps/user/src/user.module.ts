import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { PrismaService } from './prisma.service';
import { IUserRepository } from './user.repository';
import { UserPrismaRepository } from './prisma.repository';

@Module({
  imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: path.resolve(process.cwd(), 'apps/user/.env'),
        ignoreEnvFile: process.env.NODE_ENV === 'production'
      })
    ],
  controllers: [UserController],
  providers: [
    UserService,
    PrismaService,
    {
      provide: IUserRepository,
      useClass: UserPrismaRepository
    }
  ],
})
export class UserModule {}
