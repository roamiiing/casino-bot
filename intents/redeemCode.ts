import * as uuid from "https://deno.land/std@0.202.0/uuid/mod.ts";
import { Bot } from "https://deno.land/x/grammy@v1.19.2/mod.ts";
import { kv } from "../kv.ts";
import { getUserKey } from "../helpers.ts";
import { UserState } from "../types.ts";
import { CURRENT_KEY } from "../constants.ts";

export const getCodeKey = (id: string) => [`${CURRENT_KEY}-code-treasure`, id];

export type Code = {
  active: true;
  issuedBy: number;
} | {
  active: false;
};

export default (bot: Bot) => {
  // bot.command("codegen", async (ctx) => {
  //   const userId = ctx.from?.id;

  //   if (!userId) return;

  //   const codeText = crypto.randomUUID();

  //   const code = await kv
  //     .set(getCodeKey(codeText), {
  //       active: true,
  //       issuedBy: userId,
  //     } as Code);

  //   return await ctx.reply(codeText);
  // });

  bot.command("redeem", async (ctx) => {
    if (ctx.chat.type !== "private") {
      return await ctx.reply(
        "Получить бесплатную крутку ты можешь отправив мне эту команду в личные сообщения 😄",
      );
    }

    const codeText = ctx.message?.text.split(/\s+/)[1];

    if (!codeText || !uuid.validate(codeText)) {
      return await ctx.reply(`Код недействителен`);
    }

    const userId = ctx.from?.id;

    if (!userId) return;

    const code = await kv
      .get<Code>(getCodeKey(codeText))
      .then(
        (state): Code =>
          state.value ??
            {
              active: false,
            },
      );

    if (code.active) {
      if (code.issuedBy === userId) {
        return await ctx.reply(
          "Упс, а вот свой код обналичить нельзя 🥲",
        );
      }

      const userState = await kv
        .get<UserState>(getUserKey(userId))
        .then(
          (state) =>
            state.value ??
              undefined,
        );

      if (!userState) {
        return await ctx.reply(
          "Пока ты не сделаешь хотя одну крутку - ты не сможешь пользоваться чужими кодами 🥲",
        );
      }

      const nextUserState: UserState = {
        ...userState,
        extraAttempts: (userState?.extraAttempts ?? 0) + 1,
      };

      await kv
        .atomic()
        .delete(getCodeKey(codeText))
        .set(
          getUserKey(userId),
          nextUserState,
        ).commit();

      return await ctx.reply(
        "Вот это скорость! У вас теперь есть еще одна крутка, она будет действовать до полуночи по UTC",
      );
    }

    return await ctx.reply("Сорри, этот код уже кто-то успел активировать 🤯");
  });
};

export const createFreespinCode = async (userId: number) => {
  const codeText = crypto.randomUUID();

  await kv
    .set(getCodeKey(codeText), {
      active: true,
      issuedBy: userId,
    } as Code);

  return codeText;
};
