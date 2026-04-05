import { Injectable, HttpException, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { IWalletRepository } from './wallet.respository';
import { PrismaService } from './prisma.service';
import { Wallet, Prisma } from "./generated/prisma/client"

@Injectable()
export class WalletPrismaRepository implements IWalletRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createWallet(userId: string): Promise<Wallet> {
    try {
      const wallet = await this.prisma.wallet.create({
        data: { userId, balance: 0 },
      });
      return wallet;
    } catch (e) {
      Logger.error(`failed to create wallet for user with id: ${userId}`)
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        console.log(`failed to create wallet, wallet already exist for this user ${e}, userid; ${userId}`)
        throw new ConflictException('Wallet already exists for this user');
      }
      console.log(`failed to create wallet ${e}, userid; ${userId}`)
      throw new InternalServerErrorException('Failed to create wallet');
    }
  }

  async getWalletByUserId(userId: string): Promise<Wallet> {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found')
    return wallet;
  }

async creditWallet(userId: string, idempotencyKey: string, amount: number): Promise<Wallet> {
  if (amount <= 0) throw new BadRequestException('Amount must be positive');

  try {
    return await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new NotFoundException('Wallet not found');

      const existing = await tx.transaction.findUnique({ where: { idempotencyKey } });
      if (existing) throw new ConflictException('Duplicate request: transaction already processed');
      Logger.log(`recording credit transction for credit action, user_id: ${userId}`)
      await tx.transaction.create({
        data: { walletId: wallet.id, amount, type: 'CREDIT', idempotencyKey },
      });
      Logger.log(`updating wallet after credit action, user_id: ${userId}`)
      return await tx.wallet.update({
        where: { userId },
        data: { balance: wallet.balance + BigInt(amount) },
      });
    });
  } catch (e) {
    // Re-throw NestJS HTTP exceptions — they're already handled
    if (e instanceof HttpException) throw e;

    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new ConflictException('Duplicate request: transaction already processed');
    }
    throw new InternalServerErrorException('Failed to credit wallet');
  }
}

async debitWallet(userId: string, idempotencyKey: string, amount: number): Promise<Wallet> {
  if (amount <= 0) throw new BadRequestException('Amount must be positive');

  try {
    return await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new NotFoundException('Wallet not found');
      if (wallet.balance < BigInt(amount)) throw new BadRequestException('Insufficient balance');

      const existing = await tx.transaction.findUnique({ where: { idempotencyKey } });
      if (existing) throw new ConflictException('Duplicate request: transaction already processed');

      Logger.log(`recording debit transction for debit action, user_id: ${userId}`)
      await tx.transaction.create({
        data: { walletId: wallet.id, amount, type: 'DEBIT', idempotencyKey },
      });

      Logger.log(`updating wallet after debit action, user_id: ${userId}`)
      return await tx.wallet.update({
        where: { userId },
        data: { balance: wallet.balance - BigInt(amount) },
      });
    });
  } catch (e) {
    if (e instanceof HttpException) throw e;

    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new ConflictException('Duplicate request: transaction already processed');
    }
    throw new InternalServerErrorException('Failed to debit wallet');
  }
}
}