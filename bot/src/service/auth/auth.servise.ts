import TelegramBot from 'node-telegram-bot-api';
import { stateService } from '../state/state.service';
import { userApi } from '../../api/user/user.api';

class AuthService {
  async login(msg: TelegramBot.Message) {
    stateService.clearState(msg.from.id);
    await userApi.login(msg);
  }
}

export const authService = new AuthService();