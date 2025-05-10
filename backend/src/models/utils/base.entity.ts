import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column } from 'typeorm';
import { ColumnType } from './columnTypes';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn(ColumnType.UUID)
  uuid: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: ColumnType.BOOLEAN, default: true })
  isActive: boolean;
}