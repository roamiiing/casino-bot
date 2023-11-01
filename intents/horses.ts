import { Bot } from "https://deno.land/x/grammy@v1.19.2/mod.ts";
import { kv } from "../kv.ts";
import {
  DateTime,
  getCurrentDate,
  getUserKey,
  getUserStateSafe,
  stripFirst,
} from "../helpers.ts";
import { UserState } from "../types.ts";
import { ADMINS, CURRENT_KEY } from "../constants.ts";
import { drawHorses } from "../generators/draw.ts";
import {
  createSpeeds,
  genPlaces,
  getKs,
  Koefs,
} from "../generators/horse_sequence.ts";
import { renderFramesToGIF } from "../generators/renderFramesToGIF.ts";
import { InputFile } from "https://deno.land/x/grammy@v1.19.2/types.deno.ts";
import { locales } from "../locales.ts";

export const createHorsesKey = (intentType: string, currentDate: DateTime) => [
  `${CURRENT_KEY}-intent-horse`,
  intentType,
  currentDate.toFormat("MM-dd-yyyy"),
];

const getCasinoHorseRevenueKey = () => [
  `${CURRENT_KEY}-intent-horse`,
  "revenue",
];

const getHorsesBetsKey = () => createHorsesKey("bet", getCurrentDate());

const getHorsesResultKey = () => createHorsesKey("result", getCurrentDate());

const getHorsesBetByIDKey = (id: string) => [...getHorsesBetsKey(), id];

type HorseResult = {
  winner: number;
  image: Uint8Array;
};

type HorseBet = {
  amount: number;
  horseId: number;
  user: number;
};

const HORSE_COUNT = 4;

const getStakesAndKs = async () => {
  const stakes = Object.fromEntries(
    Array.from({ length: HORSE_COUNT }, (_, i) => [i, 0]),
  );
  const _bets = await kv.list<HorseBet>({ prefix: getHorsesBetsKey() });

  const bets: { key: Deno.KvKey; value: HorseBet }[] = [];

  for await (const bet of _bets) {
    bets.push({ key: bet.key, value: bet.value });
  }

  bets.forEach((bet) => {
    stakes[bet.value.horseId] += bet.value.amount;
  });

  return {
    individualStakes: bets,
    stakes,
    ks: getKs(stakes),
  };
};

const payoff = async (
  allStakes: { key: Deno.KvKey; value: HorseBet }[],
  ks: Koefs,
  winId: number,
) => {
  //getCasinoHorseRevenueKey

  let paid = 0;

  const sum = allStakes.reduce((acc, v) => acc + v.value.amount, 0);

  const transactions = allStakes
    .filter((stake) => stake.value.horseId === winId)
    .map<{ to: number; amount: number }>((stake) => {
      const prize = Math.floor(stake.value.amount * ks[stake.value.horseId]);
      paid += prize;
      return { to: stake.value.user, amount: prize };
    });

  const users = new Set<number>();

  transactions.forEach((tx) => users.add(tx.to));

  const userList = [...users.values()];

  const batchedTx = transactions.reduce<Record<number, number>>((acc, v) => {
    acc[v.to] += v.amount;
    return acc;
  }, Object.fromEntries(userList.map((user) => [user, 0])));

  const userStates = await kv.getMany<UserState[]>(
    userList.map((user) => getUserKey(user)),
  );

  const newUserStates: { key: Deno.KvKey; value: UserState }[] = userStates
    .filter((state) => {
      const user = state.key.at(-1);
      if (!state.value || !user || typeof user !== "string") return false;
    })
    .map((state) => {
      const user = state.key.at(-1);
      return {
        key: state.key,
        value: {
          ...(state.value as UserState),
          coins: state.value!.coins +
            (user ? batchedTx?.[user as unknown as number] : 0),
        },
      };
    });

  const totalFee = sum - paid;

  const atom = kv.atomic();

  newUserStates.forEach((newState) => {
    atom.set(newState.key, newState.value);
  });
  allStakes.forEach((stake) => {
    atom.delete(stake.key);
  });
  atom.sum(getCasinoHorseRevenueKey(), BigInt(totalFee));

  const { ok } = await atom.commit();

  if (!ok) {
    console.error("Not Okey");
  }

  return transactions;
};

export default (bot: Bot) => {
  bot.command("horserun", async (ctx) => {
    const userId = ctx.from?.id;

    if (!userId || !ADMINS.includes(userId.toString())) return;

    ctx.reply("Активность запущена", {
      reply_to_message_id: ctx.update.message?.message_id,
    });

    const { individualStakes, ks } = await getStakesAndKs();

    const winner = genPlaces(HORSE_COUNT);

    const { buffers, height, width } = drawHorses(
      createSpeeds(HORSE_COUNT, winner),
    );
    const gifBuffer = await renderFramesToGIF(buffers, { height, width });

    await kv.set(getHorsesResultKey(), {
      winner: winner,
      image: buffers.at(-1)!,
    });

    await ctx.replyWithAnimation(new InputFile(gifBuffer, "horses.gif"));

    const txs = await payoff(individualStakes, ks, winner);

    setTimeout(
      () =>
        ctx.reply(
          txs.length > 0
            ? [
              "<b>Поздравляем победителей!</b>\n",
              ...txs.map(
                (tx, i) =>
                  `<a href="tg://user?id=${tx.to}">Победитель ${
                    i + 1
                  }</a>: <b>+${tx.amount}</b>`,
              ),
            ].join("\n")
            : "<b>Сегодня никому не удалось победить :(</b>",
          {
            parse_mode: "HTML",
          },
        ),
      40_000,
    );
  });

  bot.command("horse", async (ctx) => {
    if (!ctx.message?.text || !ctx.from.id) return;

    const [action, _horseId, _amount] = stripFirst(ctx.message.text).split(
      /\s+/,
    );
    if (action === "bet") {
      if (!_horseId) {
        return await ctx.reply(
          `Вы не указали номер лошади (1-${HORSE_COUNT})`,
          {
            reply_to_message_id: ctx.update.message?.message_id,
          },
        );
      }
      const horseId = parseInt(_horseId);
      if (Number.isNaN(horseId) || horseId < 1 || horseId > HORSE_COUNT) {
        return await ctx.reply(
          `Указан неверный номер лошади (1-${HORSE_COUNT})`,
          {
            reply_to_message_id: ctx.update.message?.message_id,
          },
        );
      }

      // const data = await kv.get<UserState>(getUserKey(ctx.from.id));

      // if (!data || !data.value) {
      //   return await ctx.reply(
      //     "Мы с Вами знакомимся первый раз, я конечно запоминаю всех, но придется отправить это сообщение еще раз!",
      //     {
      //       reply_to_message_id: ctx.update.message?.message_id,
      //     },
      //   );
      // }

      const user = await getUserStateSafe(ctx);

      const { coins } = user!;

      if (!_amount) {
        return await ctx.reply(`Вы не указали ставку (ваш баланс: ${coins})`, {
          reply_to_message_id: ctx.update.message?.message_id,
        });
      }
      const amount = parseInt(_amount);
      if (
        Number.isNaN(amount) || amount <= 0 || amount > coins
      ) {
        return await ctx.reply(
          `Указана неверная ставка (ваш баланс: ${coins})`,
          {
            reply_to_message_id: ctx.update.message?.message_id,
          },
        );
      }

      const stakeId = crypto.randomUUID();

      await kv
        .atomic()
        .set(getHorsesBetByIDKey(stakeId), {
          user: ctx.from.id,
          amount: amount,
          horseId: horseId - 1,
        } as HorseBet)
        .set(getUserKey(ctx.from.id), {
          ...user,
          coins: user!.coins - amount,
        })
        .commit();

      return await ctx.reply(
        `Вы поставили ${amount} на лошадь под номером ${horseId} на следующие скачки!`,
        {
          reply_to_message_id: ctx.update.message?.message_id,
        },
      );
    } else if (action === "result") {
      const result = await kv.get<HorseResult>(getHorsesResultKey());

      if (result.value) {
        const { winner, image } = result.value;

        return await ctx.replyWithPhoto(new InputFile(image, "horses.jpg"), {
          caption: `Выиграла лошадь ${winner + 1}`,
          reply_to_message_id: ctx.update.message?.message_id,
        });
      } else {
        return await ctx.reply("Сегодня скачки еще не проводились", {
          reply_to_message_id: ctx.update.message?.message_id,
        });
      }
    } else if (action === "info") {
      const { individualStakes, ks } = await getStakesAndKs();

      return await ctx.reply(
        [
          locales.stakesCreated(individualStakes.length),
          individualStakes.length > 0 && locales.koefs(ks),
        ]
          .filter(Boolean)
          .join("\n\n"),
        {
          reply_to_message_id: ctx.update.message?.message_id,
          parse_mode: "HTML",
        },
      );
    } else {
      return await ctx.reply(`Неизвестное действие ${action}`, {
        reply_to_message_id: ctx.update.message?.message_id,
      });
    }
  });
};

if (import.meta.main) {
  // await kv.delete([
  //   "test-rev0.0.3-intent-horse",
  //   "bet",
  //   "11-01-2023",
  //   "f3b1df9c-30ce-4fa4-86fa-bf44cc1e837d",
  // ]);
}
