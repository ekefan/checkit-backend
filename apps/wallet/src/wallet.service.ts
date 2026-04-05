import { Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Wallet } from './generated/prisma/client';
import { IWalletRepository } from './wallet.respository';
import { WalletResponse } from './wallet.interface'
import { UserServiceClient } from './user.interface'
import { USER_SERVICE } from './wallet.constants';
import { Logger } from '@nestjs/common';
import { GrpcErrors } from './wallet.validator';
@Injectable()
export class WalletService implements OnModuleInit {
  private userService: UserServiceClient;

  constructor(
    private readonly walletRepo: IWalletRepository,
    @Inject(USER_SERVICE) private readonly userClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.userService = this.userClient.getService<UserServiceClient>('UserService');
    Logger.log('Connected to Wallet gRPC service', 'User Service');
  }

  async createWallet(userId: string): Promise<WalletResponse> {
    Logger.log(`creating wallet for user with id: ${userId}`)
    try{
      const user = await firstValueFrom(this.userService.getUserById({ id: userId }));
      if (!user) throw GrpcErrors.notFound('No user is known with this id');
      const wallet = await this.walletRepo.createWallet(userId);
      Logger.log(`created wallet for user, id: ${userId}, wallet id: ${wallet.id}`)
      return this.toResponse(wallet);
    } catch (error) {
      this.handleGrpcError(error, 'creating wallet')
    }
    
  }

  async creditWallet(userId: string, amount: number, idempotencyKey: string): Promise<WalletResponse> {
    Logger.log(`crediting wallet for user with id: ${userId}`)
    try{
      const wallet = await this.walletRepo.creditWallet(userId, idempotencyKey, amount);
      Logger.log(`credited wallet for user with id: ${userId}`)
      return this.toResponse(wallet);
    } catch (error) {
      this.handleGrpcError(error, 'credit')
    }
  }

  async debitWallet(userId: string, amount: number, idempotencyKey: string): Promise<WalletResponse> {
    try{ 
      Logger.log(`debiting wallet for user with id: ${userId}`)
      const wallet = await this.walletRepo.debitWallet(userId, idempotencyKey, amount);
      Logger.log(`debited wallet for user with id: ${userId}`)
      return this.toResponse(wallet);
    } catch (error) {
      this.handleGrpcError(error, 'debit')
    }
  }

  async getWallet(userId: string): Promise<WalletResponse> {
    try{
      Logger.log(`fetching wallet for user with id: ${userId}`)
      const wallet = await this.walletRepo.getWalletByUserId(userId);
      if (!wallet) throw GrpcErrors.notFound('no user with id found');
      Logger.log(`fetch wallet for user... id: ${userId}`)
      return this.toResponse(wallet);
    } catch (error) {
      Logger.error(`failed to fetch wallet, user id: ${userId}`)
      this.handleGrpcError(error, 'getting wallet')
    }
  }

  private toResponse(wallet: Wallet): WalletResponse {
    return {
      id: wallet.id,
      userId: wallet.userId,
      balance: wallet.balance.toString(),
      createdAt: wallet.createdAt.toISOString(),
    };
  }

  private handleGrpcError(error: any, action: string): never {
    Logger.log(`handling request error for${action}`)
  if (error.status === 409 || error.name === 'ConflictException') {
    throw GrpcErrors.alreadyExists(error.message);
  }

  if (error.status === 404 || error.name === 'NotFoundException') {
    throw GrpcErrors.notFound(error.message);
  }

  if (error.status === 400 || error.name === 'BadRequestException') {
    throw GrpcErrors.invalidArgument(error.message);
  }

  if (error?.code) throw error;

  throw GrpcErrors.internal(`Failed to ${action} wallet: ${error.message}`);
}
}