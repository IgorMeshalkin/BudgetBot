import TelegramBot from "node-telegram-bot-api";
import { getTextContent } from "../../util/textContent";
import { currencyApi } from "../../api/currency/currency.api";
import { getManyButtons, validateNumber } from "../../util/functions";
import { stateService, StateType } from "../state/state.service";
import {
  reRenderCheckBoxList,
  showCheckBoxList,
} from "../../util/checkBoxFunctions";

class CurrencyService {
  async showCurrencyMenu(bot: TelegramBot, msg: TelegramBot.Message) {
    const textContent = getTextContent(msg.from.language_code);
    const isUserHaveCustomCurrencies =
      await currencyApi.checkExistCustomCurrencies(msg.chat.id);

    const currencyMenuButtons = [
      [
        {
          text: textContent.currencyService.mainCurrency,
          callback_data: "currency.main",
        },
      ],
      [
        {
          text: textContent.currencyService.list,
          callback_data: "currency.list",
        },
      ],
      [
        {
          text: textContent.currencyService.settingCurrencies,
          callback_data: "currency.setting",
        },
      ],
    ];

    if (isUserHaveCustomCurrencies) {
      currencyMenuButtons.push([
        {
          text: textContent.currencyService.customCurrencies,
          callback_data: "currency.custom_list",
        },
      ]);
    }

    currencyMenuButtons.push([
      {
        text: textContent.mainService.backToMain,
        callback_data: "main.back",
      },
    ]);

    const options = {
      reply_markup: {
        inline_keyboard: currencyMenuButtons,
      },
    };

    await bot.sendMessage(
      msg.chat.id,
      textContent.currencyService.title,
      options,
    );
  }

  async showMainCurrencyMenu(bot: TelegramBot, msg: TelegramBot.Message) {
    const currencies = await currencyApi.getByTelegramId(msg.chat.id);
    const textContent = getTextContent(msg.from.language_code);
    const options = {
      reply_markup: {
        inline_keyboard: [
          ...getManyButtons(
            currencies.currencies
              .filter(
                (currency) => currency.code !== currencies.mainCurrency?.code,
              )
              .map((currency) => ({
                text: currency.code,
                callback_data: `currency.chosen_main/${currency.uuid}`,
              })),
          ),
          [
            {
              text: textContent.currencyService.settingCurrencies,
              callback_data: "currency.setting",
            },
          ],
          [
            {
              text: textContent.mainService.backToMain,
              callback_data: "main.back",
            },
          ],
        ],
      },
    };

    await bot.sendMessage(
      msg.chat.id,
      textContent.currencyService.getMainCurrencyTitle(currencies.mainCurrency),
      options,
    );
  }

  async showCustomCurrenciesList(bot: TelegramBot, msg: TelegramBot.Message) {
    const currencies = await currencyApi.getByTelegramId(msg.chat.id);
    const textContent = getTextContent(msg.from.language_code);
    const options = {
      reply_markup: {
        inline_keyboard: [
          ...currencies.currencies
            .filter((curr) => curr.isCustom)
            .map((curr) => [
              {
                text: curr.code,
                callback_data: `currency.select-custom/${curr.uuid}`,
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

    await bot.sendMessage(
      msg.chat.id,
      textContent.currencyService.customListTitle,
      options,
    );
  }

  async showSelectedCustomCurrencyMenu(
    bot: TelegramBot,
    msg: TelegramBot.Message,
    chosenCurrencyUuid: string,
  ) {
    const textContent = getTextContent(msg.from.language_code);
    const currency = await currencyApi.getByUuid(chosenCurrencyUuid);
    if (currency) {
      const options = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: textContent.currencyService.update,
                callback_data: `currency.update/${currency.uuid}`,
              },
            ],
            [
              {
                text: textContent.currencyService.delete,
                callback_data: `currency.delete/${currency.uuid}`,
              },
            ],
            [
              {
                text: textContent.currencyService.back,
                callback_data: "currency.page",
              },
            ],
          ],
        },
      };

      await bot.sendMessage(
        msg.chat.id,
        textContent.currencyService.getCurrencyCardTitle(currency),
        options,
      );
    }
  }

  async startUpdate(
    bot: TelegramBot,
    msg: TelegramBot.Message,
    currencyUuid: string,
  ) {
    const textContent = getTextContent(msg.from.language_code);
    stateService.setState(msg.chat.id, {
      type: StateType.UPDATE_CURRENCY_REQUEST_NAME,
      updatedCurrencyUuid: currencyUuid,
    });
    await bot.sendMessage(
      msg.chat.id,
      textContent.currencyService.updateCurrencyNameQuestion,
    );
  }

  async requestUpdateCode(msg: TelegramBot.Message, bot: TelegramBot) {
    const textContent = getTextContent(msg.from.language_code);
    const lastState = stateService.getState(msg.chat.id);
    stateService.setState(msg.chat.id, {
      type: StateType.UPDATE_CURRENCY_REQUEST_CODE,
      updatedCurrencyUuid: lastState.updatedCurrencyUuid,
      updateCurrencyName: msg.text,
    });
    await bot.sendMessage(
      msg.chat.id,
      textContent.currencyService.updateCurrencyCodeQuestion,
    );
  }

  async requestUpdateRate(msg: TelegramBot.Message, bot: TelegramBot) {
    const textContent = getTextContent(msg.from.language_code);
    const lastState = stateService.getState(msg.chat.id);
    const currencies = await currencyApi.getByTelegramId(msg.chat.id);
    stateService.setState(msg.chat.id, {
      type: StateType.UPDATE_CURRENCY_REQUEST_RATE,
      updatedCurrencyUuid: lastState.updatedCurrencyUuid,
      updateCurrencyName: lastState.updateCurrencyName,
      updateCurrencyCode: msg.text,
    });
    await bot.sendMessage(
      msg.chat.id,
      textContent.currencyService.getCreateCurrencyRateQuestion(
        currencies.mainCurrency,
      ),
    );
  }

  async updateCurrency(msg: TelegramBot.Message, bot: TelegramBot) {
    const lastState = stateService.getState(msg.chat.id);
    const textContent = getTextContent(msg.from.language_code);
    if (!validateNumber(msg.text)) {
      await bot.sendMessage(
        msg.chat.id,
        textContent.currencyService.warnRateMessage,
      );
    } else {
      await currencyApi.update({
        uuid: lastState.updatedCurrencyUuid,
        name: lastState.updateCurrencyName,
        code: lastState.updateCurrencyCode,
        rate: msg.text,
        userTelegramId: msg.chat.id,
      });
      stateService.clearState(msg.chat.id);

      await this.showCurrencyMenu(bot, msg);
    }
  }

  async chooseMain(
    bot: TelegramBot,
    msg: TelegramBot.Message,
    chosenCurrencyUuid: string,
  ) {
    await currencyApi.chooseMain(chosenCurrencyUuid, msg.chat.id);
    await this.showCurrencyMenu(bot, msg);
  }

  async showList(bot: TelegramBot, msg: TelegramBot.Message) {
    const currencies = await currencyApi.getByTelegramId(msg.chat.id);
    const textContent = getTextContent(msg.from.language_code);
    await bot.sendMessage(
      msg.chat.id,
      textContent.currencyService.getListMessage(currencies),
    );
    await this.showCurrencyMenu(bot, msg);
  }

  async showSettingMenu(bot: TelegramBot, msg: TelegramBot.Message) {
    const textContent = getTextContent(msg.from.language_code);
    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: textContent.currencyService.create,
              callback_data: "currency.create",
            },
          ],
          [
            {
              text: textContent.currencyService.checkBox,
              callback_data: "currency.check_box",
            },
          ],
          [
            {
              text: textContent.mainService.backToMain,
              callback_data: "main.back",
            },
          ],
        ],
      },
    };

    await bot.sendMessage(
      msg.chat.id,
      textContent.currencyService.settingsTitle,
      options,
    );
  }

  async requestCurrencyName(bot: TelegramBot, msg: TelegramBot.Message) {
    const textContent = getTextContent(msg.from.language_code);
    stateService.setState(msg.chat.id, {
      type: StateType.CREATE_CUSTOM_CURRENCY_REQUEST_NAME,
    });
    await bot.sendMessage(
      msg.chat.id,
      textContent.currencyService.customCurrencyNameQuestion,
    );
  }

  async requestCurrencyCode(msg: TelegramBot.Message, bot: TelegramBot) {
    const textContent = getTextContent(msg.from.language_code);
    stateService.setState(msg.chat.id, {
      type: StateType.CREATE_CUSTOM_CURRENCY_REQUEST_CODE,
      createCurrencyName: msg.text,
    });
    await bot.sendMessage(
      msg.chat.id,
      textContent.currencyService.customCurrencyCodeQuestion,
    );
  }

  async requestCurrencyRate(msg: TelegramBot.Message, bot: TelegramBot) {
    const textContent = getTextContent(msg.from.language_code);
    const lastState = stateService.getState(msg.chat.id);
    const currencies = await currencyApi.getByTelegramId(msg.chat.id);
    stateService.setState(msg.chat.id, {
      type: StateType.CREATE_CUSTOM_CURRENCY_REQUEST_RATE,
      createCurrencyName: lastState.createCurrencyName,
      createCurrencyCode: msg.text,
    });
    await bot.sendMessage(
      msg.chat.id,
      textContent.currencyService.getCreateCurrencyRateQuestion(
        currencies.mainCurrency,
      ),
    );
  }

  async createCurrency(msg: TelegramBot.Message, bot: TelegramBot) {
    const textContent = getTextContent(msg.from.language_code);
    const lastState = stateService.getState(msg.chat.id);

    if (!validateNumber(msg.text)) {
      await bot.sendMessage(
        msg.chat.id,
        textContent.currencyService.warnRateMessage,
      );
    } else {
      await currencyApi.create({
        name: lastState.createCurrencyName,
        code: lastState.createCurrencyCode,
        rate: msg.text,
        userTelegramId: msg.chat.id,
      });
      stateService.clearState(msg.chat.id);

      await this.showCurrencyMenu(bot, msg);
    }
  }

  async showCurrencyCheckBoxes(bot: TelegramBot, msg: TelegramBot.Message) {
    const textContent = getTextContent(msg.from.language_code);

    const fullAvailableCurrencyList = await currencyApi.getFullAvailableList(
      msg.chat.id,
    );

    stateService.setState(msg.chat.id, {
      type: StateType.CURRENCY_CHECK_BOX_IS_ACTIVE,
      currencyBoxAvailableOptions: fullAvailableCurrencyList.map(
        (i) => i.currency,
      ),
      currencyCheckBoxValue: new Map<string, boolean>(
        fullAvailableCurrencyList.map((i) => [i.currency.uuid, i.isSelected]),
      ),
    });

    await showCheckBoxList(
      bot,
      msg.chat.id,
      fullAvailableCurrencyList.map((i) => ({
        uuid: i.currency.uuid,
        title: i.currency.code,
        isSelected: i.isSelected,
      })),
      textContent.currencyService.checkBoxTitle,
      textContent.currencyService.checkBoxSubmit,
      "currency.toggle",
      "currency.check_box_submit",
    );
  }

  async toggle(
    bot: TelegramBot,
    callbackQuery: TelegramBot.CallbackQuery,
    currencyUuid: string,
  ) {
    const chatId = callbackQuery.message.chat.id;
    const textContent = getTextContent(
      callbackQuery.message.from.language_code,
    );

    stateService.toggleCurrency(chatId, currencyUuid);

    const state = stateService.getState(chatId);
    const checkBoxValue = state.currencyCheckBoxValue;

    await reRenderCheckBoxList(
      bot,
      callbackQuery,
      state.currencyBoxAvailableOptions.map((i) => ({
        uuid: i.uuid,
        title: i.code,
        isSelected: checkBoxValue.get(i.uuid),
      })),
      textContent.currencyService.checkBoxSubmit,
      "currency.toggle",
      "currency.check_box_submit",
    );
  }

  async checkBoxSubmit(bot: TelegramBot, msg: TelegramBot.Message) {
    const state = stateService.getState(msg.chat.id);
    if (
      state.type === StateType.CURRENCY_CHECK_BOX_IS_ACTIVE &&
      state.currencyCheckBoxValue
    ) {
      await currencyApi.updateCurrencyList(
        msg.chat.id,
        state.currencyCheckBoxValue,
      );
      await this.showCurrencyMenu(bot, msg);
    }
  }

  async showDeleteWarnQuestion(
    bot: TelegramBot,
    msg: TelegramBot.Message,
    currencyUuid: string,
  ) {
    const textContent = getTextContent(msg.from.language_code);
    const currency = await currencyApi.getByUuid(currencyUuid);

    if (currency) {
      const options = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: textContent.currencyService.ok,
                callback_data: `currency.delete-confirm/${currency.uuid}`,
              },
            ],
            [
              {
                text: textContent.currencyService.cancel,
                callback_data: `currency.page`,
              },
            ],
          ],
        },
      };

      await bot.sendMessage(
        msg.chat.id,
        textContent.currencyService.getCurrencyDeleteTitle(currency),
        options,
      );
    }
  }

  async deleteCurrency(
    bot: TelegramBot,
    msg: TelegramBot.Message,
    currencyUuid: string,
  ) {
    await currencyApi.delete(currencyUuid, msg.chat.id);
    await this.showCurrencyMenu(bot, msg);
  }

  async callbackHandler(
    bot: TelegramBot,
    callbackQuery: TelegramBot.CallbackQuery,
    data: string,
  ) {
    const separatedData = data.split("/");
    switch (separatedData[0]) {
      case "page":
        await this.showCurrencyMenu(bot, callbackQuery.message);
        break;
      case "main":
        await this.showMainCurrencyMenu(bot, callbackQuery.message);
        break;
      case "custom_list":
        await this.showCustomCurrenciesList(bot, callbackQuery.message);
        break;
      case "select-custom":
        await this.showSelectedCustomCurrencyMenu(
          bot,
          callbackQuery.message,
          separatedData[1],
        );
        break;
      case "update":
        await this.startUpdate(bot, callbackQuery.message, separatedData[1]);
        break;
      case "delete":
        await this.showDeleteWarnQuestion(
          bot,
          callbackQuery.message,
          separatedData[1],
        );
        break;
      case "delete-confirm":
        await this.deleteCurrency(bot, callbackQuery.message, separatedData[1]);
        break;
      case "chosen_main":
        await this.chooseMain(bot, callbackQuery.message, separatedData[1]);
        break;
      case "list":
        await this.showList(bot, callbackQuery.message);
        break;
      case "setting":
        await this.showSettingMenu(bot, callbackQuery.message);
        break;
      case "create":
        await this.requestCurrencyName(bot, callbackQuery.message);
        break;
      case "check_box":
        await this.showCurrencyCheckBoxes(bot, callbackQuery.message);
        break;
      case "toggle":
        await this.toggle(bot, callbackQuery, separatedData[1]);
        break;
      case "check_box_submit":
        await this.checkBoxSubmit(bot, callbackQuery.message);
        break;
    }
  }
}

export const currencyService = new CurrencyService();
