import { Wallet } from '../wallet/wallet.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../utils/base.entity';
import { ColumnType } from '../utils/columnTypes';
import { Currency } from '../currency/currency.entity';
import { Category } from '../category/category.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ type: ColumnType.VARCHAR, nullable: false })
  userName: string;

  @Column({ type: ColumnType.BIGINT, unique: true, nullable: false })
  telegramId: number;

  @Column({ type: ColumnType.VARCHAR, nullable: true })
  firstName: string;

  @Column({ type: ColumnType.VARCHAR, nullable: true })
  lastName: string;

  @OneToMany(() => Wallet, wallet => wallet.user)
  wallets: Wallet[];

  @ManyToMany(() => Currency, currency => currency.users)
  @JoinTable({ name: 'users_currencies' })
  currencies: Currency[];

  @ManyToOne(() => Currency, { nullable: true })
  mainCurrency: Currency;

  @OneToMany(() => Currency, currency => currency.author)
  customCurrencies: Currency[];

  @OneToMany(() => Category, category => category.author)
  customCategories: Category[];
}