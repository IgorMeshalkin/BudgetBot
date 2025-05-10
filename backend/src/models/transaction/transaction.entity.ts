import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../utils/base.entity';
import { ColumnType } from '../utils/columnTypes';
import { Wallet } from '../wallet/wallet.entity';
import { Category } from '../category/category.entity';

@Entity()
@Index('idx_wallet', ['wallet'])
@Index('idx_wallet_category', ['wallet', 'category'])
export class Transaction extends BaseEntity {
  @Column({ type: ColumnType.INTEGER, nullable: false })
  amount: number;

  @ManyToOne(() => Wallet, wallet => wallet.transactions)
  wallet: Wallet;

  @ManyToOne(() => Category, category => category.transactions)
  category: Category;
}