import { WalletDto } from "@dto/wallet/wallet.dto";
import { CurrencyDto } from "@dto/currency/currency.dto";

export enum StateType {
  CREATE_WALLET_REQUEST_CURRENCY = "create_wallet_request-currency",
  CREATE_WALLET_REQUEST_NAME = "create_wallet_request-name",
  UPDATE_WALLET_REQUEST_NAME = "update_wallet_request-name",
  ADD_INCOME_REQUEST_AMOUNT = "add_income_request_amount",
  ADD_EXPENSE_REQUEST_AMOUNT = "add_expense_request_amount",
  ADD_EXPENSE_REQUEST_CATEGORY = "add_expense_request_category",
  CREATE_CUSTOM_CURRENCY_REQUEST_NAME = "create_custom_currency_request_name",
  CREATE_CUSTOM_CURRENCY_REQUEST_CODE = "create_custom_currency_request_code",
  CREATE_CUSTOM_CURRENCY_REQUEST_RATE = "create_custom_currency_request_rate",
  CURRENCY_CHECK_BOX_IS_ACTIVE = "currency_check_box_is_active",
  UPDATE_CURRENCY_REQUEST_NAME = "update_currency_request_name",
  UPDATE_CURRENCY_REQUEST_CODE = "update_currency_request_code",
  UPDATE_CURRENCY_REQUEST_RATE = "update_currency_request_rate",
}

export type TNotRequiredState = {
  chosenCurrencyUuid?: string;
  updatedWalletUuid?: string;
  walletName?: string;
  transactionWallet?: WalletDto;
  expenseAmount?: string;
  createCurrencyName?: string;
  createCurrencyCode?: string;
  createCurrencyRate?: number;
  updatedCurrencyUuid?: string;
  updateCurrencyName?: string;
  updateCurrencyCode?: string;
  updateCurrencyRate?: number;
  currencyBoxAvailableOptions?: CurrencyDto[];
  currencyCheckBoxValue?: Map<string, boolean>; // currency uuid and isSelected value
};

export type TState = {
  type: StateType;
} & TNotRequiredState;

export class StateService {
  // key(number) is user telegramId
  private userStates = new Map<number, TState>();

  setState(telegramId: number, newState: TState) {
    this.userStates.set(telegramId, newState);
  }

  addToState(telegramId: number, additionalState: TNotRequiredState) {
    const lastState = this.userStates.get(telegramId);
    this.userStates.set(telegramId, { ...lastState, ...additionalState });
  }

  getState(telegramId: number): TState | undefined {
    return this.userStates.get(telegramId);
  }

  clearState(telegramId: number) {
    this.userStates.delete(telegramId);
  }

  toggleCurrency(telegramId: number, currencyUuid: string) {
    const state = this.userStates.get(telegramId);
    if (
      state &&
      state.type === StateType.CURRENCY_CHECK_BOX_IS_ACTIVE &&
      state.currencyCheckBoxValue
    ) {
      const lastValue = state.currencyCheckBoxValue.get(currencyUuid);
      state.currencyCheckBoxValue.set(currencyUuid, !lastValue);
    }
  }
}

export const stateService = new StateService();
