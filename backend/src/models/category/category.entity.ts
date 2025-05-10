import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../utils/base.entity';
import { ColumnType } from '../utils/columnTypes';
import { CategoryType } from '@dto/category/categoty.type.enum';
import { Transaction } from '../transaction/transaction.entity';
import { User } from '../user/user.entity';

@Entity()
export class Category extends BaseEntity {
  @Column({ type: ColumnType.VARCHAR, nullable: false })
  name: string;

  @Column({ type: ColumnType.VARCHAR, nullable: true })
  description: string;

  @Column({
    type: ColumnType.ENUM,
    enum: CategoryType,
    nullable: false,
  })
  type: CategoryType;

  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions: Transaction[];

  @Column({ type: ColumnType.BOOLEAN, default: false })
  isCustom: boolean;

  @ManyToOne(() => User, (user) => user.customCurrencies, { nullable: true })
  @JoinColumn()
  author: User;
}
