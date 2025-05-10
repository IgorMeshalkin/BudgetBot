import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Currency } from '../currency/currency.entity';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Currency]), CurrencyModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}