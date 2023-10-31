/// <reference lib="deno.unstable" />

import { webhookCallback } from "https://deno.land/x/grammy@v1.19.2/mod.ts";

import { bot } from "./bot.ts";
import { kv } from "./kv.ts";

import { locales } from "./locales.ts";
import { UserState } from "./types.ts";
import { CURRENT_KEY, IS_PRODUCTION } from "./constants.ts";
import redeemCode from "./intents/redeemCode.ts";
import dice from "./intents/dice.ts";

// init
dice(bot);
redeemCode(bot);
// init end

bot.command("__debug", async (ctx) => {
  await ctx.reply(
    Object.entries({
      userId: ctx.from?.id,
      chatId: ctx.chat?.id,
    })
      .map(([key, value]) => `${key} : ${value}`)
      .join("\n"),
    {
      reply_to_message_id: ctx.message?.message_id,
    }
  );
});

bot.command("help", async (ctx) => {
  await ctx.reply(locales.help(), {
    reply_to_message_id: ctx.update.message?.message_id,
  });
});

bot.command("top", async (ctx) => {
  const users = await kv.list<UserState>({ prefix: [CURRENT_KEY] });

  const usersTop: UserState[] = [];

  for await (const user of users) {
    usersTop.push(user.value);
  }

  usersTop.sort((a, b) => b.coins - a.coins);

  const usersTopStrings = usersTop
    .slice(0, 20)
    .map((user, index) => `${index + 1}. ${user.displayName} - ${user.coins}`);

  await ctx.reply([locales.topPlayers(), ...usersTopStrings].join("\n"), {
    reply_to_message_id: ctx.update.message?.message_id,
  });
});

if (IS_PRODUCTION) {
  const handleUpdate = webhookCallback(bot, "std/http");

  Deno.serve(async (req) => {
    if (req.method === "POST") {
      const url = new URL(req.url);
      if (url.pathname.slice(1) === bot.token) {
        try {
          return await handleUpdate(req);
        } catch (err) {
          console.error(err);
        }
      }
    }
    return new Response();
  });
} else {
  bot.start();
}
