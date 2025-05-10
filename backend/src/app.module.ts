import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './models/user/user.module';
import { WalletModule } from './models/wallet/wallet.module';
import { typeOrmConfig } from './config/database';
import { CurrencyModule } from './models/currency/currency.module';
import { TransactionModule } from './models/transaction/transaction.module';
import { CategoryModule } from './models/category/category.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    UserModule,
    WalletModule,
    CurrencyModule,
    TransactionModule,
    CategoryModule
  ],
  controllers: [],
})
export class AppModule {
}
