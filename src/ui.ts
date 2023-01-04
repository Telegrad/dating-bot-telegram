import { Account, AccountLVL } from "./api";
import { UI } from "./common-types";

export const genderUi: UI = {
  inline_keyboard: [
    /* Inline buttons. 2 side-by-side */
    [{ text: "Парень 👦", callback_data: "gender-boy" }, { text: "Девушка 👩", callback_data: "gender-girl" }],
  ]
}

export const searchGenderUI: UI = {
  keyboard: [
    [{ text: "Парень 👦" }, { text: "Девушка 👩", }],
  ],
  resize_keyboard: true,
  one_time_keyboard: true
}

export const payButton = (url: string, telegramUserID: number) => {
  return {
    inline_keyboard: [
      [{ text: "Пополнить БАЛАНС", url: `${url}/?telegramUserID=${telegramUserID}` }]
    ]
  }
}

export const buyPremium = {
  inline_keyboard: [
    [{ text: "ПРЕМИУМ 7 дней 50 монет", callback_data: "pay-premiumweek" }]
  ]
}


export const controlsUI: (account: Account | null) => UI = (account: Account | null) => {
  const ui = {
    resize_keyboard: true,
    keyboard: [
      [{ text: "🚀 Поиск любого собеседника" }],
    ]
  };

  if (account?.accountLVL === AccountLVL.PRIME) {
    ui.keyboard.push([{ text: "Парень 👦" }, { text: "Девушка 👩" }]);
  }

  ui.keyboard.push([{ text: "Саппорт" }]);

  return ui;
}
