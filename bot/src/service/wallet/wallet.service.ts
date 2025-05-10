import TelegramBot from "node-telegram-bot-api";
import { stateService, StateType } from "../state/state.service";
import { getTextContent } from "../../util/textContent";
import { currencyApi } from "../../api/currency/currency.api";
import { walletApi } from "../../api/wallet/wallet.api";
import { mainService } from "../main/main.service";
import { getManyButtons } from "../../util/functions";

class WalletService {
  async showWalletMenu(bot: TelegramBot, msg: TelegramBot.Message) {
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
              text: textContent.walletService.list,
              callback_data: "wallet.list",
            },
            {
              text: textContent.walletService.create,
              callback_data: "wallet.start_create",
            },
          ],
        ],
      },
    };

    bot.sendMessage(msg.chat.id, textContent.managementService.title, options);
  }

  async showWalletList(bot: TelegramBot, msg: TelegramBot.Message) {
    const textContent = getTextContent(msg.from.language_code);
    const wallets = await walletApi.getByTelegramId(msg.chat.id);

    const options = {
      reply_markup: {
        inline_keyboard: [
          ...wallets.map((wallet) => [
            {
              text: wallet.name,
              callback_data: `wallet.select/${wallet.uuid}`,
            },
          ]),
          [
            {
              text: textContent.mainService.backToMain,
              callback_data: "main.back",
            },
          ],
        ],
      },
    };

    bot.sendMessage(msg.chat.id, textContent.walletService.listTitle, options);
  }

  async showDeleteWarnMessage(
    bot: TelegramBot,
    msg: TelegramBot.Message,
    walletUuid: string,
  ) {
    const textContent = getTextContent(msg.from.language_code);
    const wallet = await walletApi.getByUuid(walletUuid);

    if (wallet) {
      const options = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: textContent.walletService.ok,
                callback_data: `wallet.delete-confirm/${wallet.uuid}`,
              },
            ],
            [
              {
                text: textContent.walletService.cancel,
                callback_data: `wallet.list`,
              },
            ],
          ],
        },
      };

      bot.sendMessage(
        msg.chat.id,
        textContent.walletService.getWalletDeleteTitle(wallet),
        options,
      );
    }
  }

  async selectWallet(
    bot: TelegramBot,
    msg: TelegramBot.Message,
    selectedWalletUuid: string,
  ) {
    const textContent = getTextContent(msg.from.language_code);
    const walletWithBalance =
      await walletApi.getByUuidWithBalance(selectedWalletUuid);
    if (walletWithBalance) {
      const options = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: textContent.walletService.update,
                callback_data: `wallet.update/${walletWithBalance.uuid}`,
              },
            ],
            [
              {
                text: textContent.walletService.delete,
                callback_data: `wallet.delete/${walletWithBalance.uuid}`,
              },
            ],
            [
              {
                text: textContent.walletService.back,
                callback_data: "wallet.list",
              },
            ],
          ],
        },
      };

      bot.sendMessage(
        msg.chat.id,
        textContent.walletService.getWalletCardTitle(walletWithBalance),
        options,
      );
    }
  }

  // requests currency for new wallet
  async requestCurrency(bot: TelegramBot, msg: TelegramBot.Message) {
    stateService.setState(msg.from.id, {
      type: StateType.CREATE_WALLET_REQUEST_CURRENCY,
    });

    const textContent = getTextContent(msg.from.language_code);
    const currencies = await currencyApi.getByTelegramId(msg.chat.id);
    const title =
      currencies.currencies.length > 0
        ? textContent.currencyService.currencyTitle
        : textContent.currencyService.currencyNotFoundTitle;

    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: textContent.currencyService.settingCurrencies,
              callback_data: "currency.setting",
            },
          ],
          ...getManyButtons(
            currencies.currencies.map((currency) => ({
              text: currency.code,
              callback_data: `wallet.chosen_currency/${currency.uuid}`,
            })),
          ),
        ],
      },
    };
    await bot.sendMessage(msg.chat.id, title, options);
  }

  // requests new wallet name
  async requestWalletName(
    bot: TelegramBot,
    msg: TelegramBot.Message,
    data: string,
    mode: "create" | "update",
  ) {
    if (mode === "create") {
      stateService.setState(msg.chat.id, {
        type: StateType.CREATE_WALLET_REQUEST_NAME,
        chosenCurrencyUuid: data,
      });
    } else {
      stateService.setState(msg.chat.id, {
        type: StateType.UPDATE_WALLET_REQUEST_NAME,
        updatedWalletUuid: data,
      });
    }

    // requests new wallet name
    const textContent = getTextContent(msg.from.language_code);
    await bot.sendMessage(
      msg.chat.id,
      textContent.walletService.walletNameMessage,
    );
  }

  async createWallet(msg: TelegramBot.Message, bot: TelegramBot) {
    const newWalletName = msg.text;
    const newWalletCurrency = stateService.getState(
      msg.chat.id,
    ).chosenCurrencyUuid;
    if (newWalletName && newWalletCurrency) {
      await walletApi.create({
        name: newWalletName,
        currencyUuid: newWalletCurrency,
        userTelegramId: msg.chat.id,
      });
    }
    mainService.firstMessage(msg, bot);
  }

  async updateWallet(msg: TelegramBot.Message, bot: TelegramBot) {
    const newWalletName = msg.text;
    const walletUuid = stateService.getState(msg.chat.id).updatedWalletUuid;
    if (walletUuid) {
      await walletApi.update(newWalletName, walletUuid, msg.chat.id);
    }
    this.showWalletList(bot, msg);
  }

  async deleteWallet(
    bot: TelegramBot,
    msg: TelegramBot.Message,
    walletUuid: string,
  ) {
    await walletApi.delete(walletUuid, msg.chat.id);
    this.showWalletList(bot, msg);
  }

  async callbackHandler(
    bot: TelegramBot,
    callbackQuery: TelegramBot.CallbackQuery,
    data: string,
  ) {
    const separatedData = data.split("/");
    switch (separatedData[0]) {
      case "list":
        await this.showWalletList(bot, callbackQuery.message);
        break;
      case "select":
        await this.selectWallet(bot, callbackQuery.message, separatedData[1]);
        break;
      case "update":
        await this.requestWalletName(
          bot,
          callbackQuery.message,
          separatedData[1],
          "update",
        );
        break;
      case "delete":
        await this.showDeleteWarnMessage(
          bot,
          callbackQuery.message,
          separatedData[1],
        );
        break;
      case "delete-confirm":
        await this.deleteWallet(bot, callbackQuery.message, separatedData[1]);
        break;
      case "start_create":
        await this.requestCurrency(bot, callbackQuery.message);
        break;
      case "chosen_currency":
        await this.requestWalletName(
          bot,
          callbackQuery.message,
          separatedData[1],
          "create",
        );
        break;
    }
  }
}

export const walletService = new WalletService();
