import { Controller, Body, Get, Post, Query } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletTransactionDto, WalletUserIdentityDto } from './wallet.dto';
import { Wallet } from './generated/prisma/client';
import { plainToClass } from 'class-transformer';
import { WalletDto } from './wallet.dto';

@Controller("wallet")
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('credit')
  async credit(@Body() dto: WalletTransactionDto): Promise<WalletDto> {
    const wallet = await this.walletService.creditWallet(dto.userId, dto.amount, dto.idempotencyKey);
    return this.mapToWalletDto(wallet)
  }

  @Post('debit')
  async debit(@Body() dto: WalletTransactionDto): Promise<WalletDto> {
    const wallet = await this.walletService.debitWallet(dto.userId, dto.amount, dto.idempotencyKey);
    return this.mapToWalletDto(wallet)
  }

  @Post()
  async create(@Body() dto: WalletUserIdentityDto): Promise<WalletDto> {
    const wallet = await this.walletService.createWallet(dto.userId);
    return this.mapToWalletDto(wallet)
  }

  @Get()
  async get(@Query() dto: WalletUserIdentityDto): Promise<WalletDto> {
    const wallet =  await this.walletService.getWallet(dto.userId);
    return this.mapToWalletDto(wallet)
  }

  private async mapToWalletDto(wallet: Wallet): Promise<WalletDto> {
    return plainToClass(WalletDto, {
      ...wallet,
      balance: wallet.balance.toString(),
    })
  }
}
