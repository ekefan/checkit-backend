import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from  "./prisma.service"
import { Wallet, Prisma} from "./generated/prisma/client"
import { IWalletRepository } from './wallet.respository';
@Injectable()
export class WalletService {
  constructor(private readonly walletRepo: IWalletRepository) {}
  
  async createWallet(userId: string): Promise<Wallet> {
    // TODO: Uncomment once UserService microservice is ready
    // const userExists = await this.userService.getUserById(userId);
    // if (!userExists) throw new NotFoundException('User does not exist');
    return this.walletRepo.createWallet(userId);
  }
  async creditWallet(userId: string, amount: number, idempotencyKey: string): Promise<Wallet> {
    return this.walletRepo.creditWallet(userId, idempotencyKey, amount);
  }

  async debitWallet(userId: string, amount: number, idempotencyKey: string): Promise<Wallet> {
    return this.walletRepo.debitWallet(userId, idempotencyKey, amount);
  }

  async getWallet(userId: string): Promise<Wallet> {
    const wallet = await this.walletRepo.getWalletByUserId(userId);
    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }
}
