export const isGenderCallback = (callbackData: string) => callbackData.startsWith('gender');

export const parseCallbackQueryData = (queryData: string) => queryData.split('-')[1].trim();

export const isBoy = (queryData: string) => {
  const data = parseCallbackQueryData(queryData);

  return data.toLowerCase() === 'boy';
}

export const isGirl = (queryData: string) => {
  const data = parseCallbackQueryData(queryData);

  return data.toLowerCase() === 'girl';
}
