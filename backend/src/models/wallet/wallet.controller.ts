import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { WalletDto, WalletWithBalanceDto } from '@dto/wallet/wallet.dto';
import { WalletService } from './wallet.service';
import { WalletCreateDto } from '@dto/wallet/wallet.create.dto';

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get(':uuid')
  async getByUuid(@Param('uuid') uuid: string): Promise<WalletDto | null> {
    try {
      return await this.walletService.findByUuid(uuid);
    } catch (e) {
      console.error(`Failed to check user exist: ${e}`);
      return null;
    }
  }

  @Get('/balance/:uuid')
  async getByUuidWithBalance(
    @Param('uuid') uuid: string,
  ): Promise<WalletWithBalanceDto | null> {
    try {
      return await this.walletService.findByUuidWithBalance(uuid);
    } catch (e) {
      console.error(`Failed to check user exist: ${e}`);
      return null;
    }
  }

  @Get('/tg/:telegramId')
  async getByTelegramId(
    @Param('telegramId', ParseIntPipe) telegramId: number,
  ): Promise<WalletDto[] | null> {
    try {
      return await this.walletService.findByTelegramId(telegramId);
    } catch (e) {
      console.error(`Failed to check user exist: ${e}`);
      return null;
    }
  }

  @Get('/tg/balance/:telegramId')
  async getByTelegramIdWithBalance(
    @Param('telegramId', ParseIntPipe) telegramId: number,
  ): Promise<WalletWithBalanceDto[] | null> {
    try {
      return await this.walletService.findByTelegramIdWithBalance(telegramId);
    } catch (e) {
      console.error(`Failed to check user exist: ${e}`);
      return null;
    }
  }

  @Post()
  async create(
    @Body() walletCreateDto: WalletCreateDto,
  ): Promise<WalletDto | null> {
    try {
      return await this.walletService.create(walletCreateDto);
    } catch (e) {
      console.error(`Failed to check user exist: ${e}`);
      return null;
    }
  }

  @Patch(':walletUuid')
  async update(
    @Param('walletUuid') walletUuid: string,
    @Body() body: { newName: string; telegramId: number },
  ): Promise<void> {
    try {
      await this.walletService.update(
        body.newName,
        walletUuid,
        body.telegramId,
      );
    } catch (e) {
      console.error(`Failed to check user exist: ${e}`);
    }
  }

  @Patch('/delete/:walletUuid')
  async delete(
    @Param('walletUuid') walletUuid: string,
    @Body() body: { telegramId: number },
  ): Promise<void> {
    try {
      await this.walletService.delete(walletUuid, body.telegramId);
    } catch (e) {
      console.error(`Failed to check user exist: ${e}`);
    }
  }
}
