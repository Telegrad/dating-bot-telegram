import { Context } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { Telegraf } from "telegraf/typings/telegraf";

export type Bot = Telegraf<Context<Update>>;
