export class WalletCreateDto {
  name: string;
  currencyUuid: string;
  userTelegramId: number;

  constructor(init: {
    name: string;
    currencyUuid: string;
    userTelegramId: number;
  }) {
    this.name = init.name;
    this.currencyUuid = init.currencyUuid;
    this.userTelegramId = init.userTelegramId;
  }
}