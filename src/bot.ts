import { Telegraf } from 'telegraf';
import { Bot } from './common-types';
import Config from './config';
import Logger from './logger';

function setupBot(bot: Bot) {
  bot.command('quit', async (ctx) => {
    // Explicit usage
    await ctx.telegram.leaveChat(ctx.message.chat.id);

    // Using context shortcut
    await ctx.leaveChat();
  });

  bot.on('text', async (ctx) => {
    // Explicit usage
    await ctx.telegram.sendMessage(ctx.message.chat.id, `Hello ${ctx.state.role}`);

    // Using context shortcut
    await ctx.reply(`Hello ${ctx.state.role}`);
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

  const preparedBot = setupBot(bot);

  enableGracefulShutdown(preparedBot);

  preparedBot.launch();

  Logger.log("Bot is running");
}

bootstrap();
