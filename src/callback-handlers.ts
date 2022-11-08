import Api, { Gender } from "./api"
import { isBoy, isGirl, parseCallbackQueryData } from "./helpers"

export const onGenderCallback = async (queryData: string, api: Api, query: any) => {
  const gender = parseCallbackQueryData(queryData) as Gender;

  await api.updateAccount({
    telegramUserId: query.from?.id ?? 0,
    fullName: query.from?.username ?? '',
    gender,
  });
}
