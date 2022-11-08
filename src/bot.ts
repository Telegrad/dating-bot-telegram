import { Telegraf } from 'telegraf';
import { onGenderCallback } from './callback-handlers';
import { Bot } from './common-types';
import Config from './config';
import { isGenderCallback } from './helpers';
import Logger from './logger';
import * as BotMessages from "./messages";
import * as BotUi from './ui';
import Api from './api';
import { io, Socket } from "socket.io-client";

type SocketMessageType = 'video' | 'photo' | 'text' | 'voice' | 'video_note' | 'audio' | 'document' | 'sticker';

type SocketMessageData = {
  chatId: number;
  fromTelegramUserId: number;
  value: string | number;
  type: SocketMessageType;
}

type OnBotStartData = {
  telegramUserId: number;
  chatId: number;
};

type SearchData = {
  chatId: number;
  fromTelegramUserId: number;
};

type OnPartnerFoundData = {
  chatId: number;
  telegramUserId: number;
}

type StopData = {
  chatId: number;
  closedByYou?: boolean;
};

function setupBot(bot: Bot, config: Config, api: Api, socket: Socket) {
  bot.command('start', async (ctx) => {
    await ctx.reply(BotMessages.welcomeMessage);
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

    await api.saveAccount({
      fullName: ctx.update.message.from.username ?? '',
      telegramUserId: ctx.update.message.from.id
    });
  });

  bot.command('search', async (ctx) => {
    const message = ctx.update.message;

    const searchData: SearchData = {
      fromTelegramUserId: message.from.id,
      chatId: message.chat.id
    };
    socket.emit('search', searchData);
    await ctx.reply(BotMessages.searchMessage);
  });

  socket.on('partner-found', async (data: OnPartnerFoundData) => {
    await bot.telegram.sendMessage(data.chatId, BotMessages.partnerFoundMessage);
  })

  socket.on('message', async (data: SocketMessageData) => {
    try {
      if (data.type === 'photo') {
        await bot.telegram.sendPhoto(data.chatId, data.value as string);
        return;
      }
      if (data.type === 'text') {
        await bot.telegram.sendMessage(data.chatId, String(data.value));
        return;
      }
      if (data.type === 'video') {
        await bot.telegram.sendVideo(data.chatId, String(data.value));
        return;
      }
      if (data.type === 'voice') {
        await bot.telegram.sendVoice(data.chatId, String(data.value));
        return;
      }
      if (data.type === 'video_note') {
        await bot.telegram.sendVideoNote(data.chatId, String(data.value));
        return;
      }
      if (data.type === 'audio') {
        await bot.telegram.sendAudio(data.chatId, String(data.value));
        return;
      }
      if (data.type === 'document') {
        await bot.telegram.sendDocument(data.chatId, String(data.value));
        return;
      }
      if (data.type === 'sticker') {
        await bot.telegram.sendSticker(data.chatId, String(data.value));
        return;
      }
    } catch (error) {
      console.error(error);
    }
  });

  socket.on('stop', async (data: StopData) => {
    bot.telegram.sendMessage(data.chatId, data.closedByYou ? BotMessages.stopMessage : BotMessages.stopByParticipantMessage)
  });

  bot.command('stop', async (ctx) => {
    socket.emit('stop', {
      chatId: ctx.update.message.chat.id
    } as StopData)
  })

  bot.command('next', async (ctx) => {
    socket.emit('stop', {
      chatId: ctx.update.message.chat.id
    } as StopData);

    const searchData: SearchData = {
      fromTelegramUserId: ctx.update.message.from.id,
      chatId: ctx.update.message.chat.id
    };
    socket.emit('search', searchData);
    await ctx.reply(BotMessages.searchMessage);
  });

  bot.on('message', async (ctx) => {
    const { message } = ctx.update;

    const messageData: SocketMessageData = {
      chatId: ctx.update.message.chat.id,
      fromTelegramUserId: ctx.update.message.from.id,
      value: '',
      type: 'text'
    };

    if ((message as any).text) {
      messageData.type = 'text';
      messageData.value = (message as any).text;
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

    socket.emit('message', messageData);
  })

  bot.on('callback_query', async query => {
    const queryData = query.callbackQuery.data ?? '';

    if (isGenderCallback(queryData)) {
      await onGenderCallback(queryData, api, query);
      await query.reply(BotMessages.onGenderSetMessage);
      return;
    }
  });

  return bot;
}

function enableGracefulShutdown(bot: Bot) {
  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

async function bootstrap() {
  const config = new Config();
  const bot = new Telegraf(config.botToken);
  const api = new Api(config);
  const socket = io(config.serverUrl);
  const preparedBot = setupBot(bot, config, api, socket);

  enableGracefulShutdown(preparedBot);

  preparedBot.launch();

  Logger.log("Bot is running");
}

bootstrap();
