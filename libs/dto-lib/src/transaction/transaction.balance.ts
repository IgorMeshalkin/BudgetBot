export class TransactionIsSufficientBalanceDto {
  isSufficientBalance: boolean = false;
  balance?: string;
  amount?: string;
}

export type TWalletBalanceItem = {
  walletName: string;
  balance: string;
};

export class TransactionFullBalanceDto {
  walletItems: TWalletBalanceItem[];
  fullBalance: string;
}
