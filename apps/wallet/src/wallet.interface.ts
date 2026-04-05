import { Observable } from 'rxjs';

export interface CreateWalletRequest {
  userId: string;
}

export interface GetWalletRequest {
  userId: string;
}

export interface WalletTransactionRequest {
  userId: string;
  amount: number;
  idempotencyKey: string;
}

export interface WalletResponse {
  id: string;
  userId: string;
  balance: string;
  createdAt: string;
}

export interface WalletServiceClient {
  createWallet(data: CreateWalletRequest): Observable<WalletResponse>;
  getWallet(data: GetWalletRequest): Observable<WalletResponse>;
  creditWallet(data: WalletTransactionRequest): Observable<WalletResponse>;
  debitWallet(data: WalletTransactionRequest): Observable<WalletResponse>;
}