import { WalletDto, WalletWithBalanceDto } from "@dto/wallet/wallet.dto";
import { TransactionFullBalanceDto } from "@dto/transaction/transaction.balance";
import { CurrencyDto, TUserCurrenciesDto } from "@dto/currency/currency.dto";
import { CategoryDto } from "@dto/category/category.dto";
import { BaseCategoryNames } from "@dto/category/baseCategoryNames";

const textContent = [
  {
    language_code: "en",
    language_name: "English",
    mainService: {
      title: "Choose option:",
      income: "Income",
      expense: "Expense",
      management: "Management",
      miniApp: "🚀Go to MiniApp",
    },
  },
  {
    language_code: "ru",
    language_name: "Русский",
    mainService: {
      title: "Главное меню:",
      income: "🔼 Доход",
      expense: "🔽 Расход",
      fullBalance: "📊 Общий баланс",
      backToMain: "🏠 Главная",
      management: "⚙️ Управление",
      miniApp: "🚀 Открыть мини приложение",
      getFullBalanceMessage: (fullBalance: TransactionFullBalanceDto) => {
        let result = "";
        for (const walletItem of fullBalance.walletItems) {
          result += `${walletItem.walletName}:\n${walletItem.balance}\n\n`;
        }
        return `${result}Общий баланс: ${fullBalance.fullBalance}`;
      },
    },
    miniAppService: {
      message: 'В настоящее время мини приложение в разработке.\nМы уведомим вас когда оно будет доступно.'
    },
    incomeService: {
      walletTitle: "Выберите кошелёк:",
      requestAmountMessage: "Введите сумму для пополнения кошелька:",
      warnRequestAmountMessage: "Сумма должна быть числом, попробуйте снова:",
      getSuccessfullyTransactionMessage: (
        wallet: WalletDto,
        amount: string,
      ) => {
        return `На кошелёк "${wallet.name}" успешно зачислено: ${amount} ${wallet.currency.code}`;
      },
      getFailedTransactionMessage: (wallet: WalletDto, amount: string) => {
        return `Не удалось зачислить ${amount} ${wallet.currency.code} на кошелёк "${wallet.name}". Повторите попытку позже.`;
      },
    },
    expenseService: {
      walletTitle: "Выберите кошелёк:",
      requestAmountMessage: "Введите сумму для списания с кошелька:",
      warnRequestAmountMessage: "Сумма должна быть числом, попробуйте снова:",
      getSuccessfullyTransactionMessage: (
        wallet: WalletDto,
        amount: string,
      ) => {
        return `С кошелька "${wallet.name}" успешно списано: ${amount} ${wallet.currency.code}`;
      },
      getLessBalanceMessage: (
        wallet: WalletDto,
        amount: string,
        actualBalance: string,
      ) => {
        return `Баланс кошелька "${wallet.name}" меньше чем ${amount} ${wallet.currency.code}. Введите сумму не более ${actualBalance} ${wallet.currency.code}`;
      },
      getFailedTransactionMessage: (wallet: WalletDto, amount: string) => {
        return `Не удалось списать ${amount} ${wallet.currency.code} с кошелька "${wallet.name}". Повторите попытку позже.`;
      },
    },
    walletService: {
      title: "Меню кошельков:",
      listTitle: "Ваши кошельки:",
      chooseTitle: "Выберите кошелёк:",
      walletNotFoundTitle: "У вас пока нет доступных кошельков",
      createWallet: "Создать кошелёк",
      walletNameMessage: "Введите название кошелька:",
      list: "🧾 Список",
      create: "➕ Создать",
      update: "✏️ Переименовать",
      delete: "🗑️ Удалить",
      back: "🔙 Назад",
      ok: "✅ Да",
      cancel: "❌ Отмена",
      getWalletCardTitle: (walletWithBalance: WalletWithBalanceDto) => {
        return `Кошелёк: ${walletWithBalance.name}\nБаланс: ${walletWithBalance.balance}`;
      },
      getWalletDeleteTitle: (wallet: WalletDto) => {
        return `❓ Вы действительно хотите удалить кошелёк: ${wallet.name}?`;
      },
    },
    currencyService: {
      title: "Меню валют: ",
      currencyTitle: "Выберите валюту",
      settingsTitle: "Выберите действие с валютами",
      customListTitle: "Ваши кастомные валюты:",
      currencyNotFoundTitle: "У вас пока нет доступных валют",
      settingCurrencies: "💱 Настроить валюты",
      customCurrencies: "💵 Кастомные валюты",
      mainCurrency: "⭐ Главная валюта",
      list: "🧾 Список доступных валют",
      create: "➕ Создать валюту",
      update: "✏️ Редактировать",
      delete: "🗑️ Удалить",
      back: "🔙 Назад",
      ok: "✅ Да",
      cancel: "❌ Отмена",
      checkBox: "✅ Выбрать из общего списка",
      customCurrencyNameQuestion: "Введите название для своей валюты:",
      customCurrencyCodeQuestion: "Введите код своей валюты:",
      updateCurrencyNameQuestion: "Введите новое название для валюты: ",
      updateCurrencyCodeQuestion: "Введите новый код для валюты: ",
      checkBoxTitle: "Выберите валюты: ",
      checkBoxSubmit: "💾 Сохранить",
      warnRateMessage:
        "Курс по отношению к главной валюте должен быть строго целым числом или десятичной дробью. Другие символы недопустимы. Попробуйте ещё раз:",
      getCurrencyCardTitle: (currency: CurrencyDto) => {
        return `Название валюты: ${currency.name}\nКод: ${currency.code}`;
      },
      getMainCurrencyTitle: (mainCurrency: CurrencyDto) => {
        return `Ваша главная валюта: ${mainCurrency.code}\nЕсли хотите изменить выберите другую валюту из списка:`;
      },
      getListMessage: (currencies: TUserCurrenciesDto) => {
        let result = `Ваша главная валюта:\nНазвание: ${currencies.mainCurrency.name}\nКод: ${currencies.mainCurrency.code}`;
        if (currencies.currencies.length > 0) {
          result += `\n\nДоступные вам валюты:\n\n`;
        }
        for (const currency of currencies.currencies) {
          result += `Название: ${currency.name}\nКод: ${currency.code}\n\n`;
        }
        return result;
      },
      getCreateCurrencyRateQuestion: (mainCurrency: CurrencyDto) => {
        return `Ваша главная валюта: ${mainCurrency.code}\nВведите курс новой валюты по отношению к главной:`;
      },
      getCurrencyDeleteTitle: (currency: CurrencyDto) => {
        return `❓ Вы действительно хотите удалить валюту: ${currency.name} (${currency.code})?`;
      },
    },
    categoryService: {
      chooseCategoryMessage: "Выберите категорию: ",
      getCategoryName: (category: CategoryDto) => {
        switch (category.name) {
          case BaseCategoryNames.SUPERMARKET:
            return "Супермаркет";
          case BaseCategoryNames.HOUSE:
            return "Жильё";
          case BaseCategoryNames.MEDICINE:
            return "Здоровье";
          case BaseCategoryNames.TRANSPORT:
            return "Транспорт";
          case BaseCategoryNames.ENTERTAINMENT:
            return "Развлечения";
          case BaseCategoryNames.OTHER:
            return "Прочее";
        }
        return category.name;
      },
    },
    managementService: {
      title: "Меню управления ботом:",
      wallets: "💼 Кошельки",
      currencies: "💲 Валюты",
      categories: "📁 Категории",
    },
  },
];

export const getTextContent = (languageCode: string) => {
  const contentByCode = textContent.find((item) => item.language_code === "ru");
  return (
    contentByCode || textContent.find((item) => item.language_code === "en")
  );
};
