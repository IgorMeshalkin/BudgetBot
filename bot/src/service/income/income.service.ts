import { walletApi } from "../../api/wallet/wallet.api";
import { getTextContent } from "../../util/textContent";
import TelegramBot from "node-telegram-bot-api";
import { getManyButtons, validateNumber } from "../../util/functions";
import { stateService, StateType } from "../state/state.service";
import { transactionApi } from "../../api/transaction/transaction.api";
import { mainService } from "../main/main.service";

class IncomeService {
  async newIncome(msg: TelegramBot.Message, bot: TelegramBot) {
    const availableWallet = await walletApi.getByTelegramId(msg.chat.id);
    const textContent = getTextContent(msg.from.language_code);
    const title =
      availableWallet.length > 0
        ? textContent.walletService.chooseTitle
        : textContent.walletService.walletNotFoundTitle;

    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: textContent.walletService.createWallet,
              callback_data: "wallet.start_create",
            },
          ],
          ...getManyButtons(
            availableWallet.map((wallet) => ({
              text: wallet.name,
              callback_data: `income.chosen_wallet/${wallet.uuid}`,
            })),
          ),
        ],
      },
    };

    bot.sendMessage(msg.chat.id, title, options);
  }

  async requestAmount(
    bot: TelegramBot,
    msg: TelegramBot.Message,
    data: string,
  ) {
    const wallet = await walletApi.getByUuid(data);
    if (wallet) {
      stateService.setState(msg.chat.id, {
        type: StateType.ADD_INCOME_REQUEST_AMOUNT,
        transactionWallet: wallet,
      });
      const textContent = getTextContent(msg.from.language_code);
      await bot.sendMessage(
        msg.chat.id,
        `${textContent.incomeService.requestAmountMessage} "${wallet.name}"`,
      );
    }
  }

  async addIncome(msg: TelegramBot.Message, bot: TelegramBot) {
    const textContent = getTextContent(msg.from.language_code);
    if (!validateNumber(msg.text)) {
      await bot.sendMessage(
        msg.chat.id,
        textContent.incomeService.warnRequestAmountMessage,
      );
    } else {
      const state = stateService.getState(msg.chat.id);
      if (
        state &&
        state.type === StateType.ADD_INCOME_REQUEST_AMOUNT &&
        state.transactionWallet
      ) {
        const isTransactionSuccessful = await transactionApi.income(
          state.transactionWallet,
          msg.text,
        );
        isTransactionSuccessful
          ? await bot.sendMessage(
              msg.chat.id,
              textContent.incomeService.getSuccessfullyTransactionMessage(
                state.transactionWallet,
                msg.text,
              ),
            )
          : await bot.sendMessage(
              msg.chat.id,
              textContent.incomeService.getFailedTransactionMessage(
                state.transactionWallet,
                msg.text,
              ),
            );

        mainService.firstMessage(msg, bot);
      }
    }
  }

  async callbackHandler(
    bot: TelegramBot,
    callbackQuery: TelegramBot.CallbackQuery,
    data: string,
  ) {
    const separatedData = data.split("/");
    switch (separatedData[0]) {
      case "chosen_wallet":
        await this.requestAmount(bot, callbackQuery.message, separatedData[1]);
        break;
    }
  }
}

export const incomeService = new IncomeService();
