/// <reference lib="deno.unstable" />
import {
  Bot,
  webhookCallback,
} from "https://deno.land/x/grammy@v1.19.2/mod.ts";
// @deno-types="npm:@types/luxon@3.3.3"
import { DateTime } from "npm:luxon@3.4.3";
import { match, P } from "npm:ts-pattern@5.0.5";
import { locales } from "./locales.ts";

const CURRENT_KEY = Deno.env.get("CURRENT_KEY") || "users-testing-v47238";
const ATTEMPTS_LIMIT = parseInt(Deno.env.get("ATTEMPTS_LIMIT") || "3", 10);

const IS_PRODUCTION = Deno.env.get("IS_PRODUCTION") === "true";

const DICE_COST = 7;
const CASINO_DICE = "🎰";

type UserState = {
  displayName: string;
  coins: number;
  lastDayUtc: number;
  attemptCount: number;
};

const initUserState = (displayName: string): UserState => ({
  displayName,
  coins: 100,
  lastDayUtc: 0,
  attemptCount: 0,
});

const getUserKey = (id: number) => [CURRENT_KEY, id.toString()];

const kv = await Deno.openKv();

const STICKERS = ["bar", "cherry", "lemon", "seven"] as const;

const getMaxFrequency = (arr: number[]) => {
  const map = new Map<number, number>();

  for (const item of arr) {
    const count = map.get(item) ?? 0;
    map.set(item, count + 1);
  }

  const maxVal = Math.max(...map.values());
  const maxKey =
    [...map.entries()].find(([, val]) => val === maxVal)?.[0] ?? arr[0];

  return [maxKey, maxVal] as const;
};

const getPrize = (maxFrequent: number, maxFrequency: number) =>
  match([STICKERS[maxFrequent], maxFrequency])
    .with(["seven", 3], () => ({ isWin: true, prize: 100 }))
    .with([P._, 3], () => ({ isWin: true, prize: 21 }))
    .with([P._, 2], () => ({ isWin: true, prize: 3 }))
    .otherwise(() => ({ isWin: false, prize: -DICE_COST }));

const bot = new Bot(Deno.env.get("BOT_TOKEN") ?? "");

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

bot.on(":dice", async (ctx) => {
  if (ctx.update.message?.dice.emoji === CASINO_DICE) {
    const { value } = ctx.update.message.dice;

    // https://core.telegram.org/api/dice
    const values = [0, 2, 4].map((shift) => ((value - 1) >> shift) & 0b11);

    const isForwarded = Boolean(ctx.update.message?.forward_date);

    if (isForwarded) {
      await ctx.reply(locales.doNotCheat(), {
        reply_to_message_id: ctx.update.message?.message_id,
      });
      return;
    }

    const userId = ctx.from?.id;

    if (!userId) return;

    const userState = await kv
      .get<UserState>(getUserKey(userId))
      .then(
        (state) =>
          state.value ??
          initUserState(
            ctx.from?.username || ctx.from?.first_name || `User ID: ${userId}`
          )
      );

    const currentDay = DateTime.now().set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });

    const isCurrentDay = currentDay.toMillis() === userState.lastDayUtc;

    const isAttemptsLimitReached =
      userState.attemptCount >= ATTEMPTS_LIMIT && isCurrentDay;

    if (isAttemptsLimitReached) {
      await ctx.reply(locales.attemptsLimit(ATTEMPTS_LIMIT), {
        reply_to_message_id: ctx.update.message?.message_id,
      });
      return;
    }

    if (userState.coins < DICE_COST) {
      await ctx.reply(locales.notEnoughCoins(DICE_COST), {
        reply_to_message_id: ctx.update.message?.message_id,
      });
      return;
    }

    const [maxFrequent, maxFrequency] = getMaxFrequency(values);

    const { isWin, prize } = getPrize(maxFrequent, maxFrequency);

    const nextUserState: UserState = {
      ...userState,
      coins: userState.coins + prize,
      lastDayUtc: currentDay.toMillis(),
      attemptCount: isCurrentDay ? userState.attemptCount + 1 : 1,
    };

    await kv.set(getUserKey(userId), nextUserState);

    const result = isWin ? locales.win(prize) : locales.lose(DICE_COST);
    const yourBalance = locales.yourBalance(nextUserState.coins);

    await ctx.reply([result, yourBalance].join("\n"), {
      reply_to_message_id: ctx.update.message?.message_id,
    });
  }
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
