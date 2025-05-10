import axios from "axios";
import { url } from "../config";

class CategoryApi {
  async getByTelegramId(telegramId: number) {
    try {
      const response = await axios.get(`${url}/categories/tg/${telegramId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to check user exist:", error.message);
    }
  }
}

export const categoryApi = new CategoryApi();
