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
    [{ text: "7 дней", callback_data: "pay-premiumweek" }],
    [{ text: "🏆 1 месяц 🏆", callback_data: "pay-premiummonth" }]
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

  ui.keyboard.push([{ text: "Настройки ⚙️" }]);

  return ui;
}

export const settingsUI = {
  if (account?.accountLVL === AccountLVL.PRIME) {
      resize_keyboard: true,
  keyboard: [
    [{ text: "Изменить пол 🌚" }],
    [{ text: "Баланс 💰" }],
    [{ text: "Пополнить баланс 💰" }],
    [{ text: "Рефералы 💌" }],
    [{ text: "Будущее обновления 🪚" }],
    [{ text: "Сапорт ❤️" }],
    [{ text: "Назад ↩️" }]
  ]
  } else {
    resize_keyboard: true,
  keyboard: [
    [{ text: "Изменить пол 🌚" }],
    [{ text: "Баланс 💰" }],
    [{ text: "Пополнить баланс 💰" }],
    [{ text: "💎 Купить премиум 💎" }],
    [{ text: "Рефералы 💌" }],
    [{ text: "Будущее обновления 🪚" }],
    [{ text: "Сапорт ❤️" }],
    [{ text: "Назад ↩️" }]
  ]
  } 
}

export const conversationUI = {
  resize_keyboard: true,
  keyboard: [
    [{ text: "Стоп ⛔️" }, { text: "Искать дальше ➡️" }],
    [{ text: "Поделиться профилем 📩" }],
  ]
}

export const searchUI = {
  resize_keyboard: true,
  keyboard: [
    [{ text: "Остановить поиск ⛔️" }],
  ]
}
