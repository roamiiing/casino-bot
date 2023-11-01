import { Bot } from "https://deno.land/x/grammy@v1.19.2/mod.ts";
import { ATTEMPTS_LIMIT, CASINO_DICE, DICE_COST } from "../constants.ts";
import { getGasTax } from "../gas.ts";
import {
  DateTime,
  getFreespinCode,
  getMaxFrequency,
  getPrize,
  getUserKey,
  initUserState,
} from "../helpers.ts";
import { kv } from "../kv.ts";
import { locales } from "../locales.ts";
import { UserState } from "../types.ts";
import { linkFreespinCode } from "./redeemCode.ts";

export default (bot: Bot) =>
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
                ctx.from?.username || ctx.from?.first_name ||
                  `User ID: ${userId}`,
              ),
        );

      const currentDay = DateTime.now().setZone("UTC+7").set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      });

      const isCurrentDay = currentDay.toMillis() === userState.lastDayUtc;

      const isAttemptsLimitReached = userState.attemptCount >=
          (ATTEMPTS_LIMIT + (userState.extraAttempts ?? 0)) &&
        isCurrentDay;

      if (isAttemptsLimitReached) {
        await ctx.reply(
          locales.attemptsLimit(
            ATTEMPTS_LIMIT + (userState.extraAttempts ?? 0),
          ),
          {
            reply_to_message_id: ctx.update.message?.message_id,
            parse_mode: "HTML",
          },
        );
        return;
      }

      const gas = getGasTax(DICE_COST);
      const fixedLoss = DICE_COST + gas;

      if (userState.coins < fixedLoss) {
        await ctx.reply(locales.notEnoughCoins(fixedLoss), {
          reply_to_message_id: ctx.update.message?.message_id,
        });
        return;
      }

      const [maxFrequent, maxFrequency, rolls] = getMaxFrequency(values);

      const prize = getPrize(maxFrequent, maxFrequency, rolls);
      const isWin = (prize - fixedLoss) > 0;

      const nextUserState: UserState = {
        ...userState,
        coins: userState.coins + prize - fixedLoss,
        lastDayUtc: currentDay.toMillis(),
        attemptCount: isCurrentDay ? userState.attemptCount + 1 : 1,
        extraAttempts: isCurrentDay ? userState.extraAttempts : 0,
      };

      await kv.set(getUserKey(userId), nextUserState);

      const isNotPrivateChat = ctx.chat.type !== "private";

      const result = isWin
        ? locales.win(prize, fixedLoss)
        : locales.lose(fixedLoss, prize);
      const yourBalance = locales.yourBalance(nextUserState.coins);

      await ctx.reply(
        [result, yourBalance].join(
          "\n",
        ),
        {
          reply_to_message_id: ctx.update.message?.message_id,
          parse_mode: "HTML",
        },
      );

      const freespinCode = isNotPrivateChat && await getFreespinCode(userId);
      const freespinCodeIntergration = freespinCode &&
        locales.freespinQuote(freespinCode);

      if (freespinCode && freespinCodeIntergration) {
        const reply = await ctx.reply(freespinCodeIntergration, {
          reply_to_message_id: ctx.update.message?.message_id,
          parse_mode: "HTML",
        });

        linkFreespinCode(freespinCode, reply);
      }
    }
  });
