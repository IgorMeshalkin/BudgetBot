import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Wallet } from './wallet.entity';
import { WalletDto, WalletWithBalanceDto } from '@dto/wallet/wallet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletCreateDto } from '@dto/wallet/wallet.create.dto';
import { User } from '../user/user.entity';
import { Currency } from '../currency/currency.entity';
import { TransactionService } from '../transaction/transaction.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly transactionService: TransactionService,
  ) {}

  async findByUuid(uuid: string): Promise<WalletDto | null> {
    const wallet = await this.walletRepository.findOne({
      where: { uuid: uuid, isActive: true },
      relations: ['currency'],
    });
    if (wallet) {
      return WalletDto.fromEntityAndBalance(wallet);
    }
    return null;
  }

  async findByUuidWithBalance(
    uuid: string,
  ): Promise<WalletWithBalanceDto | null> {
    const wallet = await this.walletRepository.findOne({
      where: { uuid: uuid, isActive: true },
      relations: ['currency'],
    });
    if (wallet) {
      const balance = await this.transactionService.getBalanceString(
        wallet.uuid,
        wallet.currency.code,
      );
      return WalletWithBalanceDto.fromEntity(wallet, balance);
    }
    return null;
  }

  async findByTelegramId(telegramId: number): Promise<WalletDto[]> {
    const wallets = await this.walletRepository
      .createQueryBuilder('wallet')
      .leftJoinAndSelect('wallet.user', 'user')
      .leftJoinAndSelect('wallet.currency', 'currency')
      .where('user.telegramId = :telegramId', { telegramId })
      .andWhere('wallet.isActive = true')
      .getMany();
    return wallets.map((w) => WalletDto.fromEntityAndBalance(w));
  }

  async findByTelegramIdWithBalance(
    telegramId: number,
  ): Promise<WalletWithBalanceDto[]> {
    const wallets = await this.walletRepository
      .createQueryBuilder('wallet')
      .leftJoinAndSelect('wallet.user', 'user')
      .leftJoinAndSelect('wallet.currency', 'currency')
      .where('user.telegramId = :telegramId', { telegramId })
      .andWhere('wallet.isActive = true')
      .getMany();

    return await Promise.all(
      wallets.map(async (w) => {
        const balance = await this.transactionService.getBalanceString(
          w.uuid,
          w.currency.code,
        );
        return WalletWithBalanceDto.fromEntity(w, balance);
      }),
    );
  }

  async create(walletCreateDto: WalletCreateDto): Promise<WalletDto | null> {
    const user = await this.userRepository.findOne({
      where: { telegramId: walletCreateDto.userTelegramId },
    });
    const currency = await this.currencyRepository.findOne({
      where: { uuid: walletCreateDto.currencyUuid },
    });
    if (user && currency) {
      return this.walletRepository.save({
        name: walletCreateDto.name,
        currency: currency,
        user: user,
      });
    }
    return null;
  }

  async update(
    newName: string,
    walletUuid: string,
    telegramId: number,
  ): Promise<void> {
    await this.updateWallet(walletUuid, telegramId, { name: newName });
  }

  async delete(walletUuid: string, telegramId: number): Promise<void> {
    await this.updateWallet(walletUuid, telegramId, { isActive: false });
  }

  private async updateWallet(
    walletUuid: string,
    telegramId: number,
    partialEntity: any,
  ): Promise<void> {
    const wallet = await this.walletRepository.findOne({
      where: { uuid: walletUuid },
      relations: ['user'],
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (Number(wallet.user.telegramId) !== telegramId) {
      throw new ForbiddenException('User is not owner of this wallet');
    }
    await this.walletRepository.update({ uuid: wallet.uuid }, partialEntity);
  }
}
