import TelegramBot from "node-telegram-bot-api";
import { getTextContent } from "../../util/textContent";
import { walletService } from "../wallet/wallet.service";
import { currencyService } from "../currency/currency.service";

class ManagementService {
  showMenu(msg: TelegramBot.Message, bot: TelegramBot): void {
    const textContent = getTextContent(msg.from.language_code);

    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: textContent.mainService.backToMain,
              callback_data: "main.back",
            },
          ],
          [
            {
              text: textContent.managementService.wallets,
              callback_data: "management.wallet",
            },
            {
              text: textContent.managementService.currencies,
              callback_data: "management.currency",
            },
            {
              text: textContent.managementService.categories,
              callback_data: "main.category",
            },
          ],
        ],
      },
    };

    bot.sendMessage(msg.chat.id, textContent.managementService.title, options);
  }

  async callbackHandler(
    bot: TelegramBot,
    callbackQuery: TelegramBot.CallbackQuery,
    data: string,
  ) {
    switch (data) {
      case "wallet":
        await walletService.showWalletMenu(bot, callbackQuery.message);
        break;
      case "currency":
        await currencyService.showCurrencyMenu(bot, callbackQuery.message);
        break;
    }
  }
}

export const managementService = new ManagementService();
