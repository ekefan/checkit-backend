import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { WalletService } from './wallet.service';
import type {
  CreateWalletRequest,
  GetWalletRequest,
  WalletTransactionRequest,
  WalletResponse,
} from './wallet.interface';

@Controller()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @GrpcMethod('WalletService', 'CreateWallet')
  async createWallet(data: CreateWalletRequest): Promise<WalletResponse> {
    return this.walletService.createWallet(data.userId);
  }

  @GrpcMethod('WalletService', 'GetWallet')
  async getWallet(data: GetWalletRequest): Promise<WalletResponse> {
    return this.walletService.getWallet(data.userId);
  }

  @GrpcMethod('WalletService', 'CreditWallet')
  async creditWallet(data: WalletTransactionRequest): Promise<WalletResponse> {
    return this.walletService.creditWallet(data.userId, data.amount, data.idempotencyKey);
  }

  @GrpcMethod('WalletService', 'DebitWallet')
  async debitWallet(data: WalletTransactionRequest): Promise<WalletResponse> {
    return this.walletService.debitWallet(data.userId, data.amount, data.idempotencyKey);
  }
}