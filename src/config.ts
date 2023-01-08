

import Dotenv from "dotenv";
import { join } from "path";

type Env = {
  BOT_TOKEN?: string;
  SERVER_URL?: string;
  PAYMENT_URL?: string;
  CHANNEL_LOGS_CHAT_ID?: string;
};

type Options = Readonly<{
  envPath: string;
}>;

const defaultEnvPath = join(__dirname, '..', '.env');

export default class Config {
  constructor(options: Options = { envPath: defaultEnvPath }) {
    // load .env to process.env
    Dotenv.config({ path: options.envPath });

    this.validateEnv(this.loadEnv(process.env));
  }

  private loadEnv(sourceEnv: NodeJS.ProcessEnv): Env {
    const env: Env = {};
    env.BOT_TOKEN = sourceEnv.BOT_TOKEN;
    env.SERVER_URL = sourceEnv.SERVER_URL;
    env.PAYMENT_URL = sourceEnv.PAYMENT_URL;
    env.CHANNEL_LOGS_CHAT_ID = sourceEnv.CHANNEL_LOGS_CHAT_ID;

    return env;
  }

  private validateEnv(env: NodeJS.ProcessEnv) {
    if (!env.BOT_TOKEN) {
      throw new Error('BOT_TOKEN must be specified');
    }
    if (!env.SERVER_URL) {
      throw new Error('SERVER_URL must be specified');
    }
    if (!env.PAYMENT_URL) {
      throw new Error('PAYMENT URL must be specified');
    }
    if (!env.CHANNEL_LOGS_CHAT_ID) {
      throw new Error('CHANNEL_LOGS_CHAT_ID must be specified');
    }
  }

  get botToken(): string {
    return process.env.BOT_TOKEN!;
  }

  get serverUrl(): string {
    return process.env.SERVER_URL!;
  }

  get paymentUrl(): string {
    return process.env.PAYMENT_URL!;
  }

  get channelLogsChatID(): number {
    return Number(process.env.CHANNEL_LOGS_CHAT_ID!);
  }
}
