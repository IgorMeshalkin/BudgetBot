import TelegramBot from "node-telegram-bot-api";
import { getTextContent } from "../../util/textContent";
import { incomeService } from "../income/income.service";
import { expenseService } from "../expense/expense.service";
import { transactionApi } from "../../api/transaction/transaction.api";
import { managementService } from "../management/management.service";
import { miniAppService } from '../miniApp/miniApp.service';

class MainService {
  firstMessage(msg: TelegramBot.Message, bot: TelegramBot): void {
    const textContent = getTextContent(msg.from.language_code);

    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: textContent.mainService.miniApp, callback_data: "main.mini_app" }],
          [
            {
              text: textContent.mainService.management,
              callback_data: "main.management",
            },
          ],
          [
            {
              text: textContent.mainService.fullBalance,
              callback_data: "main.balance",
            },
          ],
          [
            {
              text: textContent.mainService.income,
              callback_data: "main.income",
            },
            {
              text: textContent.mainService.expense,
              callback_data: "main.expense",
            },
          ],
        ],
      },
    };

    bot.sendMessage(msg.chat.id, textContent.mainService.title, options);
  }

  async showFullBalance(msg: TelegramBot.Message, bot: TelegramBot) {
    const textContent = getTextContent(msg.from.language_code);
    const fullBalance = await transactionApi.getFullBalance(msg.chat.id);
    await bot.sendMessage(
      msg.chat.id,
      textContent.mainService.getFullBalanceMessage(fullBalance),
    );
    this.firstMessage(msg, bot);
  }

  async callbackHandler(
    bot: TelegramBot,
    callbackQuery: TelegramBot.CallbackQuery,
    data: string,
  ) {
    switch (data) {
      case "mini_app":
        await miniAppService.callMiniApp(callbackQuery.message, bot);
        break;
      case "income":
        await incomeService.newIncome(callbackQuery.message, bot);
        break;
      case "expense":
        await expenseService.newExpense(callbackQuery.message, bot);
        break;
      case "balance":
        await this.showFullBalance(callbackQuery.message, bot);
        break;
      case "management":
        await managementService.showMenu(callbackQuery.message, bot);
        break;
      case "back":
        this.firstMessage(callbackQuery.message, bot);
    }
  }
}

export const mainService = new MainService();
