export class Wallet {
  id: string;
  userId: string;
  balance: bigint;
  createdAt: Date;

  constructor(id: string, userId: string, balance: bigint, createdAt: Date) {
    this.id = id;
    this.userId = userId;
    this.balance = balance;
    this.createdAt = createdAt;
  }
}