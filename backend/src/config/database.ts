import { DataSourceOptions } from 'typeorm';
import { User } from '../models/user/user.entity';
import { Wallet } from '../models/wallet/wallet.entity';
import { Currency } from '../models/currency/currency.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as dotenv from 'dotenv';
import { Transaction } from '../models/transaction/transaction.entity';
import { Category } from '../models/category/category.entity';

dotenv.config();

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [User, Wallet, Currency, Transaction, Category],
  synchronize: true,
  logging: false,
  namingStrategy: new SnakeNamingStrategy(),
};
