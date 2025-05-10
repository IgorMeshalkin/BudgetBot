import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Currency } from './currency.entity';
import { CurrencyDto, TUserCurrenciesDto } from '@dto/currency/currency.dto';
import { User } from '../user/user.entity';
import {
  CurrencyCreateDto,
  CurrencyUpdateDto,
} from '@dto/currency/currency.create.dto';
import { BaseCurrencyCodes } from '../../config/databaseInit';
import { RATE_NORMALIZER } from '../../config/const';
import { CurrencyAvailableDto } from '@dto/currency/currency.available.dto';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByUuid(uuid: string): Promise<CurrencyDto | null> {
    return await this.currencyRepository.findOne({ where: { uuid, isActive: true } });
  }

  async findByTelegramId(telegramId: number): Promise<TUserCurrenciesDto> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.currencies', 'currency', 'currency.isActive = true')
      .leftJoinAndSelect('user.mainCurrency', 'mainCurrency')
      .where('user.telegramId = :telegramId', { telegramId })
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      currencies: user.currencies.map((cur) => CurrencyDto.fromEntity(cur)),
      mainCurrency: CurrencyDto.fromEntity(user.mainCurrency),
    };
  }

  async checkExistCustomCurrencies(telegramId: number): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { telegramId },
      relations: ['currencies', 'mainCurrency'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const customCurrenciesCount = await this.currencyRepository.count({
      where: {
        uuid: In(user.currencies.map((curr) => curr.uuid)),
        isActive: true,
        author: { uuid: user.uuid },
      },
    });
    return customCurrenciesCount > 0;
  }

  async getFullAvailableList(
    telegramId: number,
  ): Promise<CurrencyAvailableDto[]> {
    const user = await this.userRepository.findOne({
      where: { telegramId },
      relations: ['currencies'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const availableCurrencies = await this.currencyRepository.find({
      where: [
        { isActive: true, isCustom: false },
        { isActive: true, isCustom: true, author: { uuid: user.uuid } },
      ],
    });

    return availableCurrencies.map((curr) => ({
      currency: CurrencyDto.fromEntity(curr),
      isSelected: user.currencies.some((u) => u.uuid === curr.uuid),
    }));
  }

  async create(currencyCreateDto: CurrencyCreateDto): Promise<CurrencyDto> {
    const user = await this.userRepository.findOne({
      where: { telegramId: currencyCreateDto.userTelegramId },
      relations: ['currencies', 'mainCurrency'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const usdRate = this.calculateUsdRate(
      currencyCreateDto.rate,
      user.mainCurrency,
    );

    const createdCurrency = await this.currencyRepository.save({
      name: currencyCreateDto.name,
      code: currencyCreateDto.code,
      usdRate: usdRate,
      isCustom: true,
      author: user,
    });

    user.currencies.push(createdCurrency);
    await this.userRepository.save(user);

    return createdCurrency;
  }

  async update(
    uuid: string,
    currencyUpdateDto: CurrencyUpdateDto,
  ): Promise<void> {
    await this.updateCurrency(uuid, currencyUpdateDto.userTelegramId, {
      name: currencyUpdateDto.name,
      code: currencyUpdateDto.code,
      rate: currencyUpdateDto.rate,
    });
  }

  async chooseMain(currencyUuid: string, telegramId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { telegramId },
      relations: ['currencies'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currency = await this.currencyRepository.findOne({
      where: { uuid: currencyUuid },
    });
    if (!currency) {
      throw new NotFoundException('Currency not found');
    }

    if (!user.currencies.some((curr) => curr.uuid === currency.uuid)) {
      throw new BadRequestException(
        "User doesn't have this currency in the his available currencies list",
      );
    }

    await this.userRepository.update(
      { uuid: user.uuid },
      { mainCurrency: currency },
    );
  }

  async updateCurrencyList(
    telegramId: number,
    updatingCurrencies: Map<string, boolean>,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { telegramId },
      relations: ['currencies', 'mainCurrency'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatingCurrenciesUuidArray = Array.from(updatingCurrencies.keys());
    const currencies = await this.currencyRepository.find({
      where: { uuid: In(updatingCurrenciesUuidArray) },
    });

    const newCurrencyList = [...user.currencies];
    const toRemoveCurrencyUuids: string[] = [];

    for (const currency of currencies) {
      const isSelected = updatingCurrencies.get(currency.uuid);
      const isContainsInUsersList = user.currencies.some(
        (curr) => curr.uuid === currency.uuid,
      );
      if (isSelected && !isContainsInUsersList) {
        newCurrencyList.push(currency);
      } else if (
        !isSelected &&
        isContainsInUsersList &&
        currency.uuid !== user.mainCurrency.uuid // user can't remove his main currency from the list
      ) {
        toRemoveCurrencyUuids.push(currency.uuid);
      }
    }

    user.currencies = newCurrencyList.filter(
      (curr) => !toRemoveCurrencyUuids.includes(curr.uuid),
    );

    await this.userRepository.save(user);
  }

  async delete(currencyUuid: string, telegramId: number): Promise<void> {
    await this.updateCurrency(currencyUuid, telegramId, { isActive: false });
  }

  private async updateCurrency(
    currencyUuid: string,
    telegramId: number,
    partialEntity: any,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { telegramId: telegramId },
      relations: ['mainCurrency'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currency = await this.currencyRepository.findOne({
      where: { uuid: currencyUuid },
      relations: ['author'],
    });
    if (!currency) {
      throw new NotFoundException('Currency not found');
    }

    if (currency.author.uuid !== user.uuid) {
      throw new BadRequestException(
        'This currency does not belong to this user',
      );
    }

    const updateData = {
      ...partialEntity,
    };

    if (partialEntity.rate) {
      updateData.usdRate = this.calculateUsdRate(partialEntity.rate, user.mainCurrency);
      delete updateData.rate;
    }

    await this.currencyRepository.update({ uuid: currencyUuid }, updateData);
  }

  private calculateUsdRate(
    newCurrencyToMainCurrencyRate: string,
    mainCurrency: Currency,
  ) {
    const numNewRate = Number(
      newCurrencyToMainCurrencyRate.replace(',', '.').trim(),
    );
    if (mainCurrency.code === BaseCurrencyCodes.DOLLAR) {
      return Math.round(numNewRate * RATE_NORMALIZER);
    } else {
      return Math.round(mainCurrency.usdRate * numNewRate);
    }
  }
}
