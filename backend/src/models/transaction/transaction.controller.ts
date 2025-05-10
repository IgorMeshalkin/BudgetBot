import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import {
  TransactionFullBalanceDto,
  TransactionIsSufficientBalanceDto,
} from '@dto/transaction/transaction.balance';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('/income/:walletUuid')
  async income(
    @Param('walletUuid') walletUuid: string,
    @Body() body: { amount: string },
  ): Promise<void> {
    try {
      return await this.transactionService.income(walletUuid, body.amount);
    } catch (e) {
      console.error(`Failed to check user exist: ${e}`);
    }
  }

  @Post('/expense/:walletUuid/:categoryUuid')
  async expense(
    @Param('walletUuid') walletUuid: string,
    @Param('categoryUuid') categoryUuid: string,
    @Body()
    body: {
      amount: string;
    },
  ): Promise<TransactionIsSufficientBalanceDto | null> {
    try {
      return await this.transactionService.expense(walletUuid, categoryUuid, body.amount);
    } catch (e) {
      console.error(`Failed to check user exist: ${e}`);
      return null;
    }
  }

  @Get('/full-balance/:telegramId')
  async getFullBalance(
    @Param('telegramId', ParseIntPipe) telegramId: number,
  ): Promise<TransactionFullBalanceDto | null> {
    try {
      return await this.transactionService.getFullBalance(telegramId);
    } catch (e) {
      console.error(`Failed to check user exist: ${e}`);
      return null;
    }
  }
}
