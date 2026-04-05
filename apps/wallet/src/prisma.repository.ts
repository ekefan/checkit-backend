import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IWalletRepository } from './wallet.respository';
import { PrismaService } from './prisma.service';
import { Wallet } from './wallet.entity';

@Injectable()
export class WalletPrismaRepository implements IWalletRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(wallet: any): Wallet {
    return new Wallet(
    wallet.id,
    wallet.userId,
    BigInt(wallet.balance),
    wallet.createdAt,
  );
  }
  async createWallet(userId: string) {
    const wallet = await this.prisma.wallet.create({
      data: { userId, balance: 0 },
    });
    return this.mapToEntity(wallet)
  }

  async getWalletByUserId(userId: string) {
    const wallet = this.prisma.wallet.findUnique({ where: { userId } });
    return this.mapToEntity(wallet)
  }

  async creditWallet(userId, idempotencyKey: string, amount: number,) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');
    // ==================================================
    // =========IMPLEMENTED OPTIONAL REQUIREMENT=========
    // ==================================================
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new NotFoundException('Wallet not found');

      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount,
          type: 'CREDIT',
          idempotencyKey: idempotencyKey,
        },
      });

      const walletUpdated = tx.wallet.update({
        where: { userId },
        data: { balance: wallet.balance + BigInt(amount) },
      });
      return this.mapToEntity(walletUpdated)
    });
  }

  async debitWallet(userId, idempotencyKey: string, amount: number) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    // ==================================================
    // =========IMPLEMENTED OPTIONAL REQUIREMENT=========
    // ==================================================
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new NotFoundException('Wallet not found');
      if (wallet.balance < amount) throw new BadRequestException('Insufficient balance');

      // Record transaction
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount,
          type: 'DEBIT',
          idempotencyKey: idempotencyKey,
        },
      });

      const walletUpdated =  tx.wallet.update({
        where: { userId },
        data: { balance: wallet.balance - BigInt(amount) },
      });

      return this.mapToEntity(walletUpdated)
    });
  }
}