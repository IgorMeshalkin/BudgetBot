import axios from "axios";
import { url } from "../config";
import { WalletCreateDto } from "@dto/wallet/wallet.create.dto";

class WalletApi {
  async getByUuid(uuid: string) {
    try {
      const response = await axios.get(`${url}/wallets/${uuid}`);
      return response.data;
    } catch (error) {
      console.error("Failed to check user exist:", error.message);
    }
  }

  async getByUuidWithBalance(uuid: string) {
    try {
      const response = await axios.get(`${url}/wallets/balance/${uuid}`);
      return response.data;
    } catch (error) {
      console.error("Failed to check user exist:", error.message);
    }
  }

  async getByTelegramId(telegramId: number) {
    try {
      const response = await axios.get(`${url}/wallets/tg/${telegramId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to check user exist:", error.message);
    }
  }

  async create(wallet: WalletCreateDto) {
    try {
      const response = await axios.post(`${url}/wallets`, wallet);
      return response.data;
    } catch (error) {
      console.error("Failed to check user exist:", error.message);
    }
  }

  async update(newName: string, walletUuid: string, telegramId: number) {
    try {
      await axios.patch(`${url}/wallets/${walletUuid}`, {
        newName: newName,
        telegramId: telegramId,
      });
    } catch (error) {
      console.error("Failed to check user exist:", error.message);
    }
  }

  async delete(walletUuid: string, telegramId: number) {
    try {
      await axios.patch(`${url}/wallets/delete/${walletUuid}`, {
        telegramId: telegramId,
      });
    } catch (error) {
      console.error("Failed to check user exist:", error.message);
    }
  }
}

export const walletApi = new WalletApi();
