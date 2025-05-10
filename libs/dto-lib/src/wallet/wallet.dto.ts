import { CurrencyDto } from '../currency/currency.dto';

export class WalletDto {
  uuid: string;
  name: string;
  currency: CurrencyDto;

  constructor(init: {
    uuid: string;
    name: string;
    currency: CurrencyDto;
  }) {
    this.uuid = init.uuid;
    this.name = init.name;
    this.currency = init.currency;
  }

  static fromEntityAndBalance(entity: any): WalletDto {
    return new WalletDto({
      uuid: entity.uuid,
      name: entity.name,
      currency: CurrencyDto.fromEntity(entity.currency),
    });
  }
}

export class WalletWithBalanceDto extends WalletDto {
  balance: string;

  constructor(init: {
    uuid: string;
    name: string;
    currency: CurrencyDto;
    balance: string;
  }) {
    super({
      uuid: init.uuid,
      name: init.name,
      currency: init.currency,
    });
    this.balance = init.balance;
  }

  static fromEntity(entity: any, balance: string): WalletWithBalanceDto {
    return new WalletWithBalanceDto({
      uuid: entity.uuid,
      name: entity.name,
      currency: CurrencyDto.fromEntity(entity.currency),
      balance,
    });
  }
}