import axios from 'axios';
import { url } from '../config';
import TelegramBot from 'node-telegram-bot-api';
import { UserCreateDto } from '@dto/user/user.create.dto';

class UserApi {
  async login(msg: TelegramBot.Message) {
    try {
      const checkOrCreateUser = new UserCreateDto(msg)
      const response = await axios.post(`${url}/users/login`, checkOrCreateUser);
      return response.data;
    } catch (error) {
      console.error('Failed to check user exist:', error.message);
    }
  }
}

export const userApi = new UserApi();
