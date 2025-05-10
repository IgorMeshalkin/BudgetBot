export class CurrencyCreateDto {
  name: string;
  code: string;
  rate: string;
  userTelegramId: number;
}

export class CurrencyUpdateDto extends CurrencyCreateDto {
  uuid: string;
}
