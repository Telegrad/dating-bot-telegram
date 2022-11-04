

import Dotenv from "dotenv";
import { join } from "path";

type Env = {
  BOT_TOKEN?: string;
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

    return env;
  }

  private validateEnv(env: NodeJS.ProcessEnv) {
    if (!env.BOT_TOKEN) {
      throw new Error('BOT_TOKEN must be specified');
    }
  }

  get botToken(): string {
    return process.env.BOT_TOKEN!;
  }
}
