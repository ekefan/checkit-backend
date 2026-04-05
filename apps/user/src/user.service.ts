import { Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { User } from './generated/prisma/client';
import { IUserRepository } from './user.repository';
import { CreateUserResponse, UserResponse, } from './user.interface';
import { WalletServiceClient } from './wallet.interface'
import { WALLET_SERVICE } from './user.constants';
import { Logger } from '@nestjs/common';
import { GrpcErrors } from './user.validator';

@Injectable()
export class UserService implements OnModuleInit {
  private walletService: WalletServiceClient;

  constructor(
    private readonly userRepo: IUserRepository,
    @Inject(WALLET_SERVICE) private readonly walletClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.walletService = this.walletClient.getService<WalletServiceClient>('WalletService');
    Logger.log('Connected to Wallet gRPC service', 'Wallet Service');
  }

  async createUser(data: { email: string; name: string }): Promise<CreateUserResponse> {
    try{
      const user = await this.userRepo.createUser(data);
      const wallet = await firstValueFrom(this.walletService.createWallet({ userId: user.id }));

      return {
        ...this.toResponse(user),
        walletId: wallet.id,
      };
    } catch (error) {
      if (error?.name === 'ConflictException' || error.status === 409) {
        throw GrpcErrors.alreadyExists(error.message || "user already exists");
      }
      throw GrpcErrors.internal('Failed to create user')
    }
  }

  async getUserById(userId: string): Promise<UserResponse> {
    const user = await this.userRepo.getUserById(userId);
    if (!user) throw GrpcErrors.notFound('No user is known with this id');
    return this.toResponse(user);
}
  private toResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
    };
  }
}