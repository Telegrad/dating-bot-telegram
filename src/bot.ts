import { Context, Telegraf } from 'telegraf';
import { onGenderCallback, onPayCallback } from './callback-handlers';
import { Bot } from './common-types';
import Config from './config';
import { isGenderCallback, isPayCallback } from './helpers';
import Logger from './logger';
import * as BotMessages from "./messages";
import * as BotUi from './ui';
import Api, { Account, Gender } from './api';
import { io, Socket } from "socket.io-client";

type SocketMessageType = 'video' | 'photo' | 'text' | 'voice' | 'video_note' | 'audio' | 'document' | 'sticker';

type SocketMessageData = {
  chatId: number;
  fromTelegramUserId: number;
  value: string | number;
  replyMessageId?: number;
  type: SocketMessageType;
}

type OnBotStartData = {
  telegramUserId: number;
  chatId: number;
};

type SearchData = {
  chatId: number;
  fromTelegramUserId: number;
  gender?: Gender;
};

type OnPartnerFoundData = {
  chatId: number;
  telegramUserId: number;
}

type StopData = {
  telegramUserID: number;
  chatId: number;
  closedByYou?: boolean;
};

type NoPrimeAccountData = {
  chatID: number;
}

function setupBot(bot: Bot, config: Config, api: Api, socket: Socket) {
  bot.command('start', async (ctx) => {
    try {
      const referralCode = ctx.update.message?.text?.split(' ')[1]?.trim();

      const account = await api.saveAccount({
        fullName: ctx.update.message.from.username ?? 'no name',
        telegramUserId: ctx.update.message.from.id,
        invitedByReferralCode: referralCode ? Number(referralCode) : undefined,
      });

      await ctx.reply(BotMessages.welcomeMessage, { reply_markup: BotUi.controlsUI(account) })
      await ctx.reply(BotMessages.setGenderMessage, {
        reply_markup: BotUi.genderUi
      });
      // BOT START SOCKET TASK
      const botStartData: OnBotStartData = {
        telegramUserId: ctx.update.message.from.id,
        chatId: ctx.update.message.chat.id
      };
      socket.emit('bot-start', botStartData);
      // ***************************************************
    } catch (error) {
      console.error(error);
    }
  });

  bot.command('search', async (ctx) => {
    try {
      const message = ctx.update.message;

      const searchData: SearchData = {
        fromTelegramUserId: message.from.id,
        chatId: message.chat.id
      };
      socket.emit('search', searchData);
      await ctx.reply(BotMessages.searchMessage);
    } catch (error) {
      console.error(error);
    }
  });

  bot.command('gendersearch', async (ctx) => {
    // const message = ctx.update.message;

    try {
      await bot.telegram.sendMessage(ctx.chat.id, BotMessages.genderSearchMessage, {
        reply_markup: BotUi.searchGenderUI
      });
    } catch (error) {
      console.error(error);
    }
  })

  socket.on('partner-found', async (data: OnPartnerFoundData) => {
    try {
      await bot.telegram.sendMessage(data.chatId, BotMessages.partnerFoundMessage, {
        reply_markup: BotUi.conversationUI
      });
    } catch (error) {
      console.error(error);
    }
  })

  socket.on('no-prime-account', async (data: NoPrimeAccountData) => {
    try {
      await bot.telegram.sendMessage(data.chatID, BotMessages.noPrimeAccount, {
        reply_markup: BotUi.buyPremium
      })
    } catch (error) {
      console.error(error);
    }
  })

  socket.on('message', async (data: SocketMessageData) => {
    // const extra = data.replyMessageId ? { reply_to_message_id: Number(data.replyMessageId) } : {};
    const extra = {};

    try {
      if (data.type === 'photo') {
        await bot.telegram.sendPhoto(data.chatId, data.value as string, extra);
        return;
      }
      if (data.type === 'text') {
        await bot.telegram.sendMessage(data.chatId, String(data.value), { ...extra, parse_mode: "HTML" });
        return;
      }
      if (data.type === 'video') {
        await bot.telegram.sendVideo(data.chatId, String(data.value), extra);
        return;
      }
      if (data.type === 'voice') {
        await bot.telegram.sendVoice(data.chatId, String(data.value), extra);
        return;
      }
      if (data.type === 'video_note') {
        await bot.telegram.sendVideoNote(data.chatId, String(data.value), extra);
        return;
      }
      if (data.type === 'audio') {
        await bot.telegram.sendAudio(data.chatId, String(data.value), extra);
        return;
      }
      if (data.type === 'document') {
        await bot.telegram.sendDocument(data.chatId, String(data.value), extra);
        return;
      }
      if (data.type === 'sticker') {
        await bot.telegram.sendSticker(data.chatId, String(data.value), extra);
        return;
      }
    } catch (error) {
      console.error(error);
    }
  });

  socket.on('stop', async (data: StopData) => {
    try {
      const account = await api.getAccountByTelegramId(data.telegramUserID);
      await bot.telegram.sendMessage(data.chatId, data.closedByYou ? BotMessages.stopMessage : BotMessages.stopByParticipantMessage, {
        reply_markup: BotUi.controlsUI(account as Account)
      })
    } catch (error) {
      console.error(error);
    }
  });

  bot.command('stop', async (ctx) => {
    socket.emit('stop', {
      chatId: ctx.update.message.chat.id,
      telegramUserID: ctx.update.message.from.id
    } as StopData)
  })

  bot.command('next', async (ctx) => {
    try {
      socket.emit('stop', {
        chatId: ctx.update.message.chat.id,
        telegramUserID: ctx.update.message.from.id
      } as StopData);

      const searchData: SearchData = {
        fromTelegramUserId: ctx.update.message.from.id,
        chatId: ctx.update.message.chat.id
      };
      socket.emit('search', searchData);
      await ctx.reply(BotMessages.searchMessage);
    } catch (error) {
      console.error(error);
    }
  });

  bot.command('pay', async (ctx) => {
    try {
      await ctx.reply(BotMessages.payPrimeMessage, {
        reply_markup: BotUi.payButton(config.paymentUrl, ctx.update.message.from.id)
      });
    } catch (error) {
      console.error(error);
    }
  })

  bot.command('coins', async (ctx) => {
    try {
      const account = await api.getAccountByTelegramId(ctx.update.message.from.id);

      await ctx.reply(BotMessages.coinsBalance(account?.coins));
    } catch (error) {
      console.error(error);
    }
  })

  bot.on('message', async (ctx) => {
    const { message } = ctx.update;

    const messageData: SocketMessageData = {
      chatId: ctx.update.message.chat.id,
      fromTelegramUserId: ctx.update.message.from.id,
      value: '',
      type: 'text'
    };

    // if ((message as any)?.reply_to_message?.message_id) {
    //   messageData.replyMessageId = (message as any).reply_to_message.message_id - 1;
    // }

    try {
      if ((message as any).text) {
        messageData.type = 'text';
        messageData.value = (message as any).text;

        const searchData: SearchData = {
          fromTelegramUserId: message.from.id,
          chatId: message.chat.id,
        };

        if (String(messageData.value).toLowerCase() === '🚀 Поиск любого собеседника'.toLowerCase()) {
          socket.emit('search', searchData);
          await ctx.reply(BotMessages.searchMessage);
          return;
        }
        if (String(messageData.value).toLowerCase() === 'Баланс 💰'.toLowerCase()) {
          const account = await api.getAccountByTelegramId(ctx.update.message.from.id);
          await ctx.reply(BotMessages.coinsBalance(account?.coins))
        }
        if (String(messageData.value).toLowerCase() === 'Изменить пол 🌚'.toLowerCase()) {
          await ctx.reply(BotMessages.setGenderMessage, { reply_markup: BotUi.genderUi });
          return;
        }
        if (String(messageData.value).toLowerCase() === 'Настройки ⚙️'.toLowerCase()) {
          await ctx.reply(BotMessages.settings, { reply_markup: BotUi.settingsUI });
          return;
        }
        if (String(messageData.value).toLowerCase() === 'Пополнить баланс 💰'.toLowerCase()) {
          const account = await api.getAccountByTelegramId(ctx.update.message.from.id);
          await ctx.reply(BotMessages.coinsBalance(account?.coins));
          await ctx.reply(BotMessages.payPrimeMessage, {
            reply_markup: BotUi.payButton(config.paymentUrl, ctx.update.message.from.id)
          })
          return;
        }
        if (String(messageData.value).toLowerCase() === '💎 Купить премиум 💎'.toLowerCase()) {
          await ctx.reply(BotMessages.buyPremium, {
            reply_markup: BotUi.buyPremium
          })
          return;
        }
        if (String(messageData.value).toLowerCase() === 'Рефералы 💌'.toLowerCase()) {
          const data: any = await api.getReferralsStatistics(ctx.update.message.from.id);
          const account = await api.getAccountByTelegramId(ctx.update.message.chat.id);

          await ctx.reply(BotMessages.referrals(data, (account ?? {}) as Account));
          return;
        }
        if (String(messageData.value).toLowerCase() === 'Будущее обновления 🪚'.toLowerCase()) {
          await ctx.reply(BotMessages.futureUpdates);
          return;
        }
        if (String(messageData.value).toLowerCase() === 'Сапорт ❤️'.toLowerCase()) {
          await ctx.reply(BotMessages.supportMessage);
          return;
        }
        if (String(messageData.value).toLowerCase() === 'Назад ↩️'.toLowerCase()) {
          const account = await api.getAccountByTelegramId(ctx.update.message.from.id);
          await ctx.reply(BotMessages.back, { reply_markup: BotUi.controlsUI(account as Account) });
          return;
        }
        if (String(messageData.value).toLowerCase() === 'Девушка 👩'.toLowerCase()) {
          searchData.gender = 'girl';
          socket.emit('search', searchData);
          await ctx.reply(BotMessages.searchMessage);
          return;
        }
        if (String(messageData.value).toLowerCase() === 'Парень 👦'.toLowerCase()) {
          searchData.gender = 'boy';
          socket.emit('search', searchData);
          await ctx.reply(BotMessages.searchMessage);
          return;
        }
        if (String(messageData.value).toLowerCase() === 'Стоп ⛔️'.toLowerCase()) {
          socket.emit('stop', {
            chatId: ctx.update.message.chat.id,
            telegramUserID: ctx.update.message.from.id
          } as StopData);
          return;
        }
        if (String(messageData.value).toLowerCase() === 'Искать дальше ➡️'.toLowerCase()) {
          try {
            socket.emit('stop', {
              chatId: ctx.update.message.chat.id,
              telegramUserID: ctx.update.message.from.id
            } as StopData);

            const searchData: SearchData = {
              fromTelegramUserId: ctx.update.message.from.id,
              chatId: ctx.update.message.chat.id
            };
            socket.emit('search', searchData);
            await ctx.reply(BotMessages.searchMessage);
          } catch (error) {
            console.error(error);
          }
          return;
        }
        if (String(messageData.value).toLowerCase() === 'Поделиться профилем'.toLowerCase()) {
          const link = `<a href="tg://user?id=${messageData.fromTelegramUserId}"><b>Ссылка</b></a>`;

          messageData.value = `Вот ссылка на мой телеграм-аккаунт ${link}

Отправлено командой /link`;
          socket.emit('message', messageData);
          await ctx.replyWithHTML(`<a href="tg://user?id=${messageData.fromTelegramUserId}"><b>Ссылка</b></a> на ваш аккаунт отправлена собеседнику`);
          return;
        }
      }
      if ((message as any).photo) {
        messageData.type = 'photo';
        messageData.value = (message as any).photo[0].file_id;
      }
      if ((message as any).video) {
        messageData.type = 'video';
        messageData.value = (message as any).video.file_id;
      }
      if ((message as any).voice) {
        messageData.type = 'voice';
        messageData.value = (message as any).voice.file_id;
      }
      if ((message as any).video_note) {
        messageData.type = 'video_note';
        messageData.value = (message as any).video_note.file_id;
      }
      if ((message as any).audio) {
        messageData.type = 'audio';
        messageData.value = (message as any).audio.file_id;
      }
      if ((message as any).document) {
        messageData.type = 'document';
        messageData.value = (message as any).document.file_id;
      }
      if ((message as any).sticker) {
        messageData.type = 'sticker';
        messageData.value = (message as any).sticker.file_id;
      }
    } catch (error) {
      console.error(error);
    }

    socket.emit('message', messageData);
  })

  bot.on('callback_query', async ctx => {
    const queryData = ctx.callbackQuery.data ?? '';

    try {
      if (isGenderCallback(queryData)) {
        await onGenderCallback(queryData, api, ctx);
        await ctx.reply(BotMessages.onGenderSetMessage);
        await ctx.deleteMessage(ctx.callbackQuery.message?.message_id)
        return;
      }
      if (isPayCallback(queryData)) {
        const messageID = await onPayCallback(queryData, api, ctx, config);

        await ctx.deleteMessage(messageID);
        return;
      }
    } catch (error) {
      console.error(error);
    }
  });

  return bot;
}

async function bootstrap() {
  const config = new Config();
  const bot = new Telegraf(config.botToken);

  const api = new Api(config);
  const socket = io(config.serverUrl);
  const preparedBot = setupBot(bot, config, api, socket);

  preparedBot.catch(async (err: unknown, ctx) => {
    console.error(err);
    await bot.telegram.sendMessage(config.channelLogsChatID, (err as Error).message)
  });

  preparedBot.launch();

  Logger.log("Bot is running");
}

bootstrap();
