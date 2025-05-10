import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { Category } from './category.entity';
import { Transaction } from '../transaction/transaction.entity';
import { TransactionService } from '../transaction/transaction.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Transaction, User])],
  providers: [CategoryService],
  controllers: [CategoryController],
})
export class CategoryModule {}
