import { UI } from "./common-types";

export const genderUi: UI = {
  inline_keyboard: [
    /* Inline buttons. 2 side-by-side */
    [{ text: "Парень 👦", callback_data: "gender-boy" }, { text: "Девушка 👩", callback_data: "gender-girl" }],
  ]
}
