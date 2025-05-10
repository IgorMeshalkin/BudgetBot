import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { UserCreateDto } from '@dto/user/user.create.dto';
import { UserDto } from '@dto/user/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Currency } from '../currency/currency.entity';
import { BaseCurrencyCodes } from '../../config/databaseInit';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
  ) {}

  async login(user: UserCreateDto): Promise<UserDto> {
    const existedUser = await this.userRepository.findOne({
      where: { telegramId: user.telegramId },
    });
    if (!existedUser) {
      const baseCurrencies = await this.currencyRepository.find({
        where: {
          code: In([
            BaseCurrencyCodes.DOLLAR,
            BaseCurrencyCodes.EURO,
            BaseCurrencyCodes.RUBBLE,
          ]),
        },
      });
      const initMainCurrency = baseCurrencies.find(
        (currency) => currency.code === BaseCurrencyCodes.DOLLAR,
      );
      if (initMainCurrency) {
        return UserDto.fromEntity(
          await this.userRepository.save({
            ...user,
            currencies: baseCurrencies,
            mainCurrency: initMainCurrency,
          }),
        );
      }
    }
    return UserDto.fromEntity(existedUser);
  }
}
