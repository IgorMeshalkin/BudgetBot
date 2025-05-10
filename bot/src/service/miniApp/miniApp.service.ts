import TelegramBot from "node-telegram-bot-api";
import { getTextContent } from "../../util/textContent";
import { mainService } from "../main/main.service";

class MiniAppService {
  async callMiniApp(msg: TelegramBot.Message, bot: TelegramBot) {
    console.log('Ну вооот');
    const textContent = getTextContent(msg.from.language_code);
    const imgLink =
      "https://i.pinimg.com/1200x/fa/81/e8/fa81e8df937d07614150ccae2bbf5c0b.jpg";

    await bot.sendPhoto(msg.chat.id, imgLink, {
      caption: textContent.miniAppService.message,
    });
    await mainService.firstMessage(msg, bot);
  }
}

export const miniAppService = new MiniAppService();
