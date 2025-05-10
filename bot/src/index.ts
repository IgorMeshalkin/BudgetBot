import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { authService } from './service/auth/auth.servise';
import { mainService } from './service/main/main.service';
import { walletService } from './service/wallet/wallet.service';
import { stateService, StateType } from './service/state/state.service';
import { incomeService } from './service/income/income.service';
import { expenseService } from './service/expense/expense.service';
import { managementService } from './service/management/management.service';
import { currencyService } from './service/currency/currency.service';

dotenv.config();

try {
  const token = process.env.BOT_TOKEN;
  const bot = new TelegramBot(token, { polling: true });
  console.log('Bot is ready');

  bot.onText(/\/start/, async (msg) => {
    await authService.login(msg);
    mainService.firstMessage(msg, bot);

  });

  bot.on('message', async (msg) => {
    if (msg.text && !msg.text.startsWith('/start')) {
      const userState = stateService.getState(msg.chat.id);
      if (userState) {
        switch (userState.type) {
          case StateType.CREATE_WALLET_REQUEST_NAME:
            await walletService.createWallet(msg, bot);
            break;
          case StateType.UPDATE_WALLET_REQUEST_NAME:
            await walletService.updateWallet(msg, bot);
            break;
          case StateType.ADD_INCOME_REQUEST_AMOUNT:
            await incomeService.addIncome(msg, bot)
            break;
          case StateType.ADD_EXPENSE_REQUEST_AMOUNT:
            await expenseService.requestCategory(msg, bot)
            break;
          case StateType.CREATE_CUSTOM_CURRENCY_REQUEST_NAME:
            await currencyService.requestCurrencyCode(msg, bot)
            break;
          case StateType.CREATE_CUSTOM_CURRENCY_REQUEST_CODE:
            await currencyService.requestCurrencyRate(msg, bot)
            break;
          case StateType.CREATE_CUSTOM_CURRENCY_REQUEST_RATE:
            await currencyService.createCurrency(msg, bot)
            break;
          case StateType.UPDATE_CURRENCY_REQUEST_NAME:
            await currencyService.requestUpdateCode(msg, bot)
            break;
          case StateType.UPDATE_CURRENCY_REQUEST_CODE:
            await currencyService.requestUpdateRate(msg, bot)
            break;
          case StateType.UPDATE_CURRENCY_REQUEST_RATE:
            await currencyService.updateCurrency(msg, bot)
            break;
        }
      }
    }
  });

  bot.on('callback_query', async (callbackQuery) => {
    if (callbackQuery.data) {
      const separatedData = callbackQuery.data.split('.');
      switch (separatedData[0]) {
        case 'main':
          await mainService.callbackHandler(bot, callbackQuery, separatedData[1]);
          break;
        case 'income':
          await incomeService.callbackHandler(bot, callbackQuery, separatedData[1]);
          break;
        case 'expense':
          await expenseService.callbackHandler(bot, callbackQuery, separatedData[1]);
          break;
        case 'wallet':
          await walletService.callbackHandler(bot, callbackQuery, separatedData[1]);
          break;
        case 'management':
          await managementService.callbackHandler(bot, callbackQuery, separatedData[1]);
          break;
        case 'currency':
          await currencyService.callbackHandler(bot, callbackQuery, separatedData[1]);
          break;
      }
    }
  });
} catch (e) {
  console.error(`Failed to start bot: ${e}`);
}