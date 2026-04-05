import { Wallet } from './wallet.entity'

export abstract class IWalletRepository {
  abstract createWallet(userId: string): Promise<Wallet>;
  abstract getWalletByUserId(userId: string): Promise<Wallet | null>;
  abstract creditWallet(userId, idempotencyKey: string, amount: number): Promise<Wallet>;
  abstract debitWallet(userId, idempotencyKey: string, amount: number): Promise<Wallet>;
}
