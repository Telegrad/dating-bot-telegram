export const isGenderCallback = (callbackData: string) => callbackData.startsWith('gender');

export const parseCallbackQueryData = (queryData: string) => queryData.split('-')[1].trim();

export const isPayCallback = (callbackData: string) => callbackData.startsWith('pay');
