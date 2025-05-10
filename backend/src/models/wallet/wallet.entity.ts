import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../utils/base.entity';
import { User } from '../user/user.entity';
import { ColumnType } from '../utils/columnTypes';
import { Currency } from '../currency/currency.entity';
import { Transaction } from '../transaction/transaction.entity';

@Entity()
export class Wallet extends BaseEntity {
  @Column({ type: ColumnType.VARCHAR, nullable: false })
  name: string;

  @ManyToOne(() => User, user => user.wallets)
  user: User;

  @ManyToOne(() => Currency)
  @JoinColumn()
  currency: Currency;

  @OneToMany(() => Transaction, transaction => transaction.wallet)
  transactions: Transaction[];
}