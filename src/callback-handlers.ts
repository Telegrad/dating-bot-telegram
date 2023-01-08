import Api, { AccountLVL, Gender } from "./api"
import { parseCallbackQueryData } from "./helpers"
import moment from 'moment';
import { payPrimeMessage } from "./messages";
import * as BotMessages from "./messages";
import * as BotUi from './ui';
import Config from "./config";
import { Context } from "telegraf";

export const onGenderCallback = async (queryData: string, api: Api, query: any) => {
  const gender = parseCallbackQueryData(queryData) as Gender;

  await api.updateAccount({
    telegramUserId: query.from?.id ?? 0,
    fullName: query.from?.username ?? 'no name',
    gender,
  });
}

export const onPayCallback = async (queryData: string, api: Api, ctx: Context, config: Config) => {
  const type = parseCallbackQueryData(queryData);
  const telegramUserId = ctx.from?.id ?? 0;
  const primeWeekPrice = 50;
  const primeMonthPrice = 200;
  const isPremiumMonth = queryData === 'pay-premiummonth';

  const account = await api.getAccountByTelegramId(telegramUserId);
  let payPrimeMessageID;

  if (isPremiumMonth) {
    if (Number(account?.coins) < primeMonthPrice) {
      await ctx.reply(BotMessages.notEnoughCoins(primeMonthPrice - Number(account?.coins)));
      payPrimeMessageID = await ctx.reply(payPrimeMessage, {
        reply_markup: BotUi.payButton(config.paymentUrl, telegramUserId)
      });

      return;
    }
  } else {
    if (Number(account?.coins) < primeWeekPrice) {
      await ctx.reply(BotMessages.notEnoughCoins(primeWeekPrice - Number(account?.coins)));
      payPrimeMessageID = await ctx.reply(payPrimeMessage, {
        reply_markup: BotUi.payButton(config.paymentUrl, telegramUserId)
      });

      return;
    }
  }

  if (isPremiumMonth) {
    // type === primeweeek then give prime on week
    await api.updateAccount({
      telegramUserId,
      fullName: ctx.from?.username ?? 'no name',
      accountLVL: AccountLVL.PRIME,
      coins: Number(account?.coins) - primeWeekPrice,
      accountLVLExpiredAt: moment().add('30', 'days').toString()
    });
  } else {
    // type === primeweeek then give prime on week
    await api.updateAccount({
      telegramUserId,
      fullName: ctx.from?.username ?? 'no name',
      accountLVL: AccountLVL.PRIME,
      coins: Number(account?.coins) - primeWeekPrice,
      accountLVLExpiredAt: moment().add('7', 'days').toString()
    });
  }

  await ctx.reply(BotMessages.successPrimeBought);

  return payPrimeMessageID;
}
