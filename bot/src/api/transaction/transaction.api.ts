import { WalletDto } from "@dto/wallet/wallet.dto";
import axios from "axios";
import { url } from "../config";
import { TransactionFullBalanceDto, TransactionIsSufficientBalanceDto } from '@dto/transaction/transaction.balance';

class TransactionApi {
  async income(wallet: WalletDto, amount: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${url}/transactions/income/${wallet.uuid}`,
        {
          amount: amount,
        },
      );
      return response.status === 201;
    } catch (error) {
      console.error("Failed to check user exist:", error.message);
    }
  }

  async expense(
    wallet: WalletDto,
    amount: string,
    categoryUuid: string,
  ): Promise<TransactionIsSufficientBalanceDto> {
    try {
      const response = await axios.post(
        `${url}/transactions/expense/${wallet.uuid}/${categoryUuid}`,
        {
          amount: amount,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to check user exist:", error.message);
    }
  }

  async getFullBalance(telegramId: number): Promise<TransactionFullBalanceDto> {
    try {
      const response = await axios.get(
        `${url}/transactions/full-balance/${telegramId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Failed to check user exist:", error.message);
    }
  }
}

export const transactionApi = new TransactionApi();
