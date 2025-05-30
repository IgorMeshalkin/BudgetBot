import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { Wallet } from '../wallet/wallet.entity';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { User } from '../user/user.entity';
import { Category } from '../category/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Wallet, User, Category])],
  providers: [TransactionService],
  controllers: [TransactionController],
  exports: [TransactionService],
})
export class TransactionModule {
}