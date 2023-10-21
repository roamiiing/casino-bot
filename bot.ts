import { Bot } from "https://deno.land/x/grammy@v1.19.2/mod.ts";
import { BOT_TOKEN } from "./constants.ts";

export const bot = new Bot(BOT_TOKEN);
