import {
  Column,
  Entity, JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../utils/base.entity';
import { ColumnType } from '../utils/columnTypes';
import { User } from '../user/user.entity';
import { Wallet } from '../wallet/wallet.entity';

@Entity()
export class Currency extends BaseEntity {
  @Column({ type: ColumnType.VARCHAR, nullable: false })
  name: string;

  @Column({ type: ColumnType.VARCHAR, nullable: false })
  code: string;

  @Column({ type: ColumnType.BIGINT, nullable: false })
  usdRate: number;

  @Column({ type: ColumnType.BOOLEAN, default: false })
  isCustom: boolean;

  @ManyToMany(() => User, (user) => user.currencies)
  @JoinTable({ name: 'users_currencies' })
  users: User[];

  @ManyToOne(() => User, (user) => user.customCurrencies, { nullable: true })
  @JoinColumn()
  author: User;

  @OneToMany(() => Wallet, (wallet) => wallet.currency)
  wallets: Wallet[];
}
