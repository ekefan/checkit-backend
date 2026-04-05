import { Controller, Get, Post } from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller("wallet")
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get("id")
  async getWallet(){
    await this.walletService.getWallet()
  }

  @Post()
  async createWallet(){
    await this.walletService.createWallet()
  }

  @Post("debit")
  async debitWallet(){
    await this.walletService.debitWallet()
  }

  @Post("credit")
  async creditWallet(){
    await this.walletService.creditWallet()
  }

  
}
