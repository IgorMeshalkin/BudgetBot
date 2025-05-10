import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '../wallet/wallet.entity';
import { AMOUNT_NORMALIZER, RATE_NORMALIZER } from '../../config/const';
import { Transaction } from './transaction.entity';
import {
  TransactionFullBalanceDto,
  TransactionIsSufficientBalanceDto,
  TWalletBalanceItem,
} from '@dto/transaction/transaction.balance';
import { User } from '../user/user.entity';
import { BaseCurrencyCodes } from '../../config/databaseInit';
import { Category } from '../category/category.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async income(walletUuid: string, amount: string): Promise<void> {
    const wallet = await this.walletRepository.findOne({
      where: { uuid: walletUuid },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    await this.transactionRepository.save({
      amount: this.getAmountValue(amount),
      wallet: wallet,
    });
  }

  async expense(
    walletUuid: string,
    categoryUuid: string,
    amount: string,
  ): Promise<TransactionIsSufficientBalanceDto> {
    const wallet = await this.walletRepository.findOne({
      where: { uuid: walletUuid },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const category = await this.categoryRepository.findOne({
      where: { uuid: categoryUuid },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const numAmount = Number(amount);
    const balance = await this.getBalance(wallet.uuid);
    if (balance < numAmount) {
      return {
        isSufficientBalance: false,
        balance: this.formatAmountString(balance),
        amount: this.formatAmountString(numAmount),
      };
    }

    await this.transactionRepository.save({
      amount: this.getAmountValue(amount) * -1,
      wallet: wallet,
      category: category,
    });

    return {
      isSufficientBalance: true,
      amount: this.formatAmountString(numAmount),
    };
  }

  private getAmountValue = (amount: string): number => {
    const numAmount = Number(amount.replaceAll(',', '.').trim());
    if (isNaN(numAmount)) {
      throw new BadRequestException('Invalid amount');
    }
    return Math.round(numAmount * AMOUNT_NORMALIZER);
  };

  async getFullBalance(telegramId: number): Promise<TransactionFullBalanceDto> {
    const user = await this.userRepository.findOne({
      where: { telegramId },
      relations: ['mainCurrency'],
    });

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    let walletItems: TWalletBalanceItem[] = [];
    let numFullBalance = 0;

    const wallets = await this.walletRepository.find({
      where: { user: { uuid: user.uuid }, isActive: true },
      relations: ['currency'],
    });

    if (wallets && wallets.length > 0) {
      walletItems = await Promise.all(
        wallets.map(async (wallet) => {
          const walletBalance = await this.getBalance(wallet.uuid);

          // full balance logic:
          const usdWalletBalance =
            wallet.currency.code === BaseCurrencyCodes.DOLLAR
              ? walletBalance
              : this.convertToUds(walletBalance, wallet.currency.usdRate);
          if (user.mainCurrency.code === BaseCurrencyCodes.DOLLAR) {
            numFullBalance += usdWalletBalance;
          } else {
            numFullBalance += this.convertFromUds(
              usdWalletBalance,
              user.mainCurrency.usdRate,
            );
          }

          return {
            walletName: wallet.name,
            balance: `${this.formatAmountString(walletBalance)} ${wallet.currency.code}`,
          };
        }),
      );
    }

    return {
      walletItems,
      fullBalance: `${this.formatAmountString(numFullBalance)} ${user.mainCurrency.code}`,
    };
  }

  async getBalance(walletUuid: string): Promise<number> {
    const { balance } = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COALESCE(SUM(transaction.amount), 0)', 'balance')
      .innerJoin('transaction.wallet', 'wallet')
      .where('wallet.uuid = :walletUuid', { walletUuid })
      .andWhere('wallet.isActive = true')
      .getRawOne();

    return Number(balance) / AMOUNT_NORMALIZER;
  }

  async getBalanceString(
    walletUuid: string,
    currencyCode: string,
  ): Promise<string> {
    const numBalance = await this.getBalance(walletUuid);
    return `${this.formatAmountString(numBalance)} ${currencyCode}`;
  }

  private formatAmountString(amount: number) {
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  private convertToUds(amount: number, rate: number): number {
    return Math.floor((amount * rate) / RATE_NORMALIZER);
  }

  private convertFromUds(amount: number, rate: number): number {
    return Math.floor((amount * RATE_NORMALIZER) / rate);
  }
}
