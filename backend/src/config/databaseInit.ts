import { DataSource, In } from 'typeorm';
import { Currency } from '../models/currency/currency.entity';
import { RATE_NORMALIZER } from './const';
import { Category } from '../models/category/category.entity';
import { CategoryType } from '@dto/category/categoty.type.enum';
import { BaseCategoryNames } from '@dto/category/baseCategoryNames';

export enum BaseCurrencyCodes {
  DOLLAR = 'USD',
  EURO = 'EUR',
  RUBBLE = 'RUB',
  DONG = 'VND',
  USDT = 'USDT',
}

const baseCurrencies = [
  {
    name: 'dollar',
    code: BaseCurrencyCodes.DOLLAR,
    usdRate: RATE_NORMALIZER,
  },
  {
    name: 'euro',
    code: BaseCurrencyCodes.EURO,
    usdRate: 1.13 * RATE_NORMALIZER,
  },
  {
    name: 'ruble',
    code: BaseCurrencyCodes.RUBBLE,
    usdRate: 0.0124 * RATE_NORMALIZER,
  },
  {
    name: 'dong',
    code: BaseCurrencyCodes.DONG,
    usdRate: 0.0000385 * RATE_NORMALIZER,
  },
  {
    name: 'usdt',
    code: BaseCurrencyCodes.USDT,
    usdRate: RATE_NORMALIZER,
  },
];

const baseCategories = [
  {
    name: BaseCategoryNames.SUPERMARKET,
    type: CategoryType.EXPENSE,
  },
  {
    name: BaseCategoryNames.HOUSE,
    type: CategoryType.EXPENSE,
  },
  {
    name: BaseCategoryNames.MEDICINE,
    type: CategoryType.EXPENSE,
  },
  {
    name: BaseCategoryNames.TRANSPORT,
    type: CategoryType.EXPENSE,
  },
  {
    name: BaseCategoryNames.ENTERTAINMENT,
    type: CategoryType.EXPENSE,
  },
  {
    name: BaseCategoryNames.OTHER,
    type: CategoryType.EXPENSE,
  },
];

export const databaseInit = async (dataSource: DataSource) => {
  // CURRENCY INIT
  const currencyRepository = dataSource.getRepository(Currency);
  const alreadyCurrencyCount = await currencyRepository.count({
    where: { code: In(baseCurrencies.map((cur) => cur.code)) },
  });
  const isAlreadyCurrencyDone = alreadyCurrencyCount > 0;
  if (!isAlreadyCurrencyDone) {
    for (const currency of baseCurrencies) {
      await currencyRepository.save({
        name: currency.name,
        code: currency.code,
        usdRate: currency.usdRate,
      });
    }
  }

  // CATEGORY INIT
  const categoryRepository = dataSource.getRepository(Category);
  const alreadyCategoryCount = await categoryRepository.count({
    where: { name: In(baseCategories.map((cat) => cat.name)) },
  });
  const isAlreadyCategoryDone = alreadyCategoryCount > 0;
  if (!isAlreadyCategoryDone) {
    for (const category of baseCategories) {
      await categoryRepository.save({
        name: category.name,
        type: category.type,
      });
    }
  }
};
