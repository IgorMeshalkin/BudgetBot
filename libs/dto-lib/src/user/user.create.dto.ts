import TelegramBot from 'node-telegram-bot-api';

export class UserCreateDto {
  telegramId: number;
  userName: string;
  firstName: string;
  lastName: string;

  constructor(msg: TelegramBot.Message) {
    this.telegramId = msg.chat.id;
    this.userName = String(msg.chat.username);
    this.firstName = String(msg.chat.first_name);
    this.lastName = String(msg.chat.last_name);
  }
}