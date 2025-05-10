export type TUserCurrenciesDto = {
  currencies: CurrencyDto[];
  mainCurrency: CurrencyDto;
};

export class CurrencyDto {
  uuid: string;
  name: string;
  code: string;
  usdRate: number;
  isCustom: boolean;

  constructor(init: {
    uuid: string;
    name: string;
    code: string;
    usdRate: number;
    isCustom: boolean;
  }) {
    this.uuid = init.uuid;
    this.name = init.name;
    this.code = init.code;
    this.usdRate = init.usdRate;
    this.isCustom = init.isCustom;
  }

  static fromEntity(entity: any): CurrencyDto {
    return new CurrencyDto({
      uuid: entity.uuid,
      name: entity.name,
      code: entity.code,
      usdRate: entity.usdRate,
      isCustom: entity.isCustom,
    });
  }
}
