import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CurrencyDto, TUserCurrenciesDto } from '@dto/currency/currency.dto';
import { CurrencyCreateDto, CurrencyUpdateDto } from '@dto/currency/currency.create.dto';
import { CurrencyAvailableDto } from '@dto/currency/currency.available.dto';

@Controller('currencies')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get(':uuid')
  async getByUuid(@Param('uuid') uuid: string): Promise<CurrencyDto | null> {
    try {
      return await this.currencyService.findByUuid(uuid);
    } catch (e) {
      console.error(`Failed to check user exist: ${e}`);
      return null;
    }
  }

  @Get('/tg/:telegramId')
  async getByTelegramId(
    @Param('telegramId', ParseIntPipe) telegramId: number,
  ): Promise<TUserCurrenciesDto | null> {
    try {
      return await this.currencyService.findByTelegramId(telegramId);
    } catch (e) {
      console.error(`Failed to check user exist: ${e}`);
      return null;
    }
  }

  @Get('/check-custom/:telegramId')
  async checkExistCustomCurrencies(
    @Param('telegramId', ParseIntPipe) telegramId: number,
  ): Promise<boolean> {
    try {
      return await this.currencyService.checkExistCustomCurrencies(telegramId);
    } catch (e) {
      console.error(`Failed to check user exist: ${e}`);
      return false;
    }
  }

  @Get('/full/:telegramId')
  async getFullAvailableList(
    @Param('telegramId', ParseIntPipe) telegramId: number,
  ): Promise<CurrencyAvailableDto[] | null> {
    try {
      return await this.currencyService.getFullAvailableList(telegramId);
    } catch (e) {
      console.error(`Failed to check user exist: ${e}`);
      return null;
    }
  }

  @Post()
  async create(@Body() currencyCreateDto: CurrencyCreateDto): Promise<void> {
    try {
      await this.currencyService.create(currencyCreateDto);
    } catch (e) {
      console.error(`Failed to check user exist: ${e}`);
    }
  }

  @Patch('/update/:uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() currencyUpdateDto: CurrencyUpdateDto,
  ): Promise<void> {
    try {
      await this.currencyService.update(uuid, currencyUpdateDto);
    } catch (e) {
      console.error(`Failed to check user exist: ${e}`);
    }
  }

  @Patch('/choose-main/:currencyUuid')
  async chooseMain(
    @Param('currencyUuid') currencyUuid: string,
    @Body() body: { telegramId: number },
  ): Promise<void> {
    try {
      await this.currencyService.chooseMain(currencyUuid, body.telegramId);
    } catch (e) {
      console.error(`Failed to check user exist: ${e}`);
    }
  }

  @Patch('update_list')
  async updateCurrencyList(
    @Body()
    body: {
      telegramId: number;
      updatingCurrencies: Record<string, boolean>; // < currency uuid, 'isSelected' state >
    },
  ): Promise<void> {
    try {
      await this.currencyService.updateCurrencyList(
        body.telegramId,
        new Map(Object.entries(body.updatingCurrencies)),
      );
    } catch (e) {
      console.error(`Failed to check user exist: ${e}`);
    }
  }

  @Patch('/delete/:currencyUuid')
  async delete(
    @Param('currencyUuid') currencyUuid: string,
    @Body() body: { telegramId: number },
  ): Promise<void> {
    try {
      await this.currencyService.delete(currencyUuid, body.telegramId);
    } catch (e) {
      console.error(`Failed to check user exist: ${e}`);
    }
  }
}
