import axios from "axios";
import { url } from "../config";
import { CurrencyCreateDto, CurrencyUpdateDto } from '@dto/currency/currency.create.dto';

class CurrencyApi {
  async getByUuid(uuid: string) {
    try {
      const response = await axios.get(`${url}/currencies/${uuid}`);
      return response.data;
    } catch (error) {
      console.error("Failed to check user exist:", error.message);
    }
  }

  async getByTelegramId(telegramId: number) {
    try {
      const response = await axios.get(`${url}/currencies/tg/${telegramId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to check user exist:", error.message);
    }
  }

  async checkExistCustomCurrencies(telegramId: number) {
    try {
      const response = await axios.get(`${url}/currencies/check-custom/${telegramId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to check user exist:", error.message);
    }
  }

  async chooseMain(chosenCurrencyUuid: string, telegramId: number) {
    try {
      const response = await axios.patch(
        `${url}/currencies/choose-main/${chosenCurrencyUuid}`,
        {
          telegramId,
        },
      );
    } catch (error) {
      console.error("Failed to check user exist:", error.message);
    }
  }

  async create(newCurrency: CurrencyCreateDto) {
    try {
      const response = await axios.post(`${url}/currencies`, newCurrency);
      return response.data;
    } catch (error) {
      console.error("Failed to check user exist:", error.message);
    }
  }

  async update(updatedCurrency: CurrencyUpdateDto) {
    try {
      const response = await axios.patch(`${url}/currencies/update/${updatedCurrency.uuid}`, updatedCurrency);
      return response.data;
    } catch (error) {
      console.error("Failed to check user exist:", error.message);
    }
  }

  async getFullAvailableList(telegramId: number) {
    try {
      const response = await axios.get(`${url}/currencies/full/${telegramId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to check user exist:", error.message);
    }
  }

  async updateCurrencyList(
    telegramId: number,
    updatingCurrencies: Map<string, boolean>, // < currency uuid, 'isSelected' state >
  ) {
    try {
      const response = await axios.patch(`${url}/currencies/update_list`, {
        telegramId,
        updatingCurrencies: Object.fromEntries(updatingCurrencies),
      });
      return response.data;
    } catch (error) {
      console.error("Failed to check user exist:", error.message);
    }
  }

  async delete(currencyUuid: string, telegramId: number) {
    try {
      await axios.patch(`${url}/currencies/delete/${currencyUuid}`, {
        telegramId: telegramId,
      });
    } catch (error) {
      console.error("Failed to check user exist:", error.message);
    }
  }
}

export const currencyApi = new CurrencyApi();
