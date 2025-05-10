import TelegramBot from 'node-telegram-bot-api';
import { stateService } from '../service/state/state.service';

export type TCheckBoxItem = {
  uuid: string,
  title: string,
  isSelected: boolean,
}

export const showCheckBoxList = async (
  bot: TelegramBot,
  telegramId: number,
  items: TCheckBoxItem[],
  titleString: string,
  submitString: string,
  callbackItemString: string,
  callbackSubmitString: string,
) => {
  const buttons = items.map((i) => {
    const state = stateService.getState(telegramId);
    const checked = state.currencyCheckBoxValue.get(i.uuid)
      ? "✅"
      : "⬜";
    return [
      {
        text: `${checked} ${i.title}`,
        callback_data: `${callbackItemString}/${i.uuid}`,
      },
    ];
  });

  buttons.push([
    {
      text: submitString,
      callback_data: callbackSubmitString,
    },
  ]);

  await bot.sendMessage(telegramId, titleString, {
    reply_markup: {
      inline_keyboard: buttons,
    },
  });
};

export const reRenderCheckBoxList = async (
  bot: TelegramBot,
  callbackQuery: TelegramBot.CallbackQuery,
  items: TCheckBoxItem[],
  submitString: string,
  callbackItemString: string,
  callbackSubmitString: string,
) => {
  const buttons = items.map((i) => {
    const state = stateService.getState(callbackQuery.message.chat.id);
    const checked = state.currencyCheckBoxValue.get(i.uuid)
      ? "✅"
      : "⬜";
    return [
      {
        text: `${checked} ${i.title}`,
        callback_data: `${callbackItemString}/${i.uuid}`,
      },
    ];
  });

  buttons.push([
    {
      text: submitString,
      callback_data: callbackSubmitString,
    },
  ]);

  await bot.editMessageReplyMarkup(
    { inline_keyboard: buttons },
    {
      chat_id: callbackQuery.message.chat.id,
      message_id: callbackQuery.message.message_id,
    },
  );

  await bot.answerCallbackQuery(callbackQuery.id);
};
