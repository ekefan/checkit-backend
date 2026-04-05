import { Injectable } from '@nestjs/common';
import { PrismaService } from  "./prisma.service"
import { Wallet, Prisma} from "./generated/prisma/client"
@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}
  
  async createWallet(): Promise<void> {
    console.log("creating wallet")
    return
  }
  async debitWallet(): Promise<void> {
    console.log("debiting wallet")
  }
  async creditWallet(): Promise<void> {
    console.log("crediting wallet")
  }

  async getWallet(): Promise<void> {
    console.log("getting wallet")
  }
}
