import { walletApi } from "../../api/wallet/wallet.api";
import { getTextContent } from "../../util/textContent";
import TelegramBot from "node-telegram-bot-api";
import { getManyButtons, validateNumber } from "../../util/functions";
import { stateService, StateType } from "../state/state.service";
import { transactionApi } from "../../api/transaction/transaction.api";
import { mainService } from "../main/main.service";
import { categoryApi } from "../../api/category/category.api";

class ExpenseService {
  async newExpense(msg: TelegramBot.Message, bot: TelegramBot) {
    const availableWallet = await walletApi.getByTelegramId(msg.chat.id);
    const textContent = getTextContent(msg.from.language_code);
    const title =
      availableWallet.length > 0
        ? textContent.walletService.chooseTitle
        : textContent.walletService.walletNotFoundTitle;

    const options = {
      reply_markup: {
        inline_keyboard: [
          ...getManyButtons(
            availableWallet.map((wallet) => ({
              text: wallet.name,
              callback_data: `expense.chosen_wallet/${wallet.uuid}`,
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
        type: StateType.ADD_EXPENSE_REQUEST_AMOUNT,
        transactionWallet: wallet,
      });
      const textContent = getTextContent(msg.from.language_code);
      await bot.sendMessage(
        msg.chat.id,
        `${textContent.expenseService.requestAmountMessage} "${wallet.name}"`,
      );
    }
  }

  async requestCategory(msg: TelegramBot.Message, bot: TelegramBot) {
    const textContent = getTextContent(msg.from.language_code);
    if (!validateNumber(msg.text)) {
      await bot.sendMessage(
        msg.chat.id,
        textContent.expenseService.warnRequestAmountMessage,
      );
    } else {
      const lastState = stateService.getState(msg.chat.id);
      stateService.setState(msg.chat.id, {
        type: StateType.ADD_EXPENSE_REQUEST_CATEGORY,
        transactionWallet: lastState.transactionWallet,
        expenseAmount: msg.text,
      });
      const categories = await categoryApi.getByTelegramId(msg.chat.id);

      const options = {
        reply_markup: {
          inline_keyboard: categories.map((cat) => [
            {
              text: textContent.categoryService.getCategoryName(cat),
              callback_data: `expense.chosen_category/${cat.uuid}`,
            },
          ]),
        },
      };
      await bot.sendMessage(
        msg.chat.id,
        textContent.categoryService.chooseCategoryMessage,
        options,
      );
    }
  }

  async addExpense(
    bot: TelegramBot,
    msg: TelegramBot.Message,
    chosenCategoryUuid: string,
  ) {
    const textContent = getTextContent(msg.from.language_code);
    const state = stateService.getState(msg.chat.id);
    if (
      state &&
      state.type === StateType.ADD_EXPENSE_REQUEST_CATEGORY &&
      state.transactionWallet &&
      state.expenseAmount
    ) {
      const transactionResult = await transactionApi.expense(
        state.transactionWallet,
        state.expenseAmount,
        chosenCategoryUuid,
      );

      if (transactionResult.isSufficientBalance) {
        await bot.sendMessage(
          msg.chat.id,
          textContent.expenseService.getSuccessfullyTransactionMessage(
            state.transactionWallet,
            transactionResult.amount,
          ),
        );
        mainService.firstMessage(msg, bot);
      } else if (!transactionResult.isSufficientBalance) {
        await bot.sendMessage(
          msg.chat.id,
          textContent.expenseService.getLessBalanceMessage(
            state.transactionWallet,
            transactionResult.amount,
            transactionResult.balance,
          ),
        );
      } else {
        await bot.sendMessage(
          msg.chat.id,
          textContent.expenseService.getFailedTransactionMessage(
            state.transactionWallet,
            state.expenseAmount,
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
      case "chosen_category":
        await this.addExpense(bot, callbackQuery.message, separatedData[1]);
        break;
    }
  }
}

export const expenseService = new ExpenseService();
