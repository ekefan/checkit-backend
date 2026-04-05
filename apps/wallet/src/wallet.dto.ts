import {IsString, IsNotEmpty, IsNumber, Min, IsDateString} from 'class-validator';

export class WalletUserIdentityDto {
    @IsString()
    @IsNotEmpty()
    userId: string;
}

export class WalletTransactionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;
}

export class WalletDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  balance: string;

  @IsDateString()
  @IsNotEmpty()
  createdAt: string;
}