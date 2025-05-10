import { Module } from '@nestjs/common';
import { Wallet } from './wallet.entity';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Currency } from '../currency/currency.entity';
import { Transaction } from '../transaction/transaction.entity';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, User, Currency]),
    TransactionModule,
  ],
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {
}