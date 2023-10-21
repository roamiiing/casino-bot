import { match, P } from "npm:ts-pattern@5.0.5";
import { CURRENT_KEY, FREECODE_PROB } from "./constants.ts";
import { UserState } from "./types.ts";
import { createFreespinCode } from "./intents/redeemCode.ts";

export const initUserState = (displayName: string): UserState => ({
  displayName,
  coins: 100,
  lastDayUtc: 0,
  attemptCount: 0,
  extraAttempts: 0,
});

export const getUserKey = (id: number) => [CURRENT_KEY, id.toString()];

export const STICKERS = ["bar", "cherry", "lemon", "seven"] as const;
export const STAKE_PRICE = [1, 1, 2, 3];

export const getMaxFrequency = (arr: number[]) => {
  const map = new Map<number, number>();

  const rolls: number[] = [];

  for (const item of arr) {
    const count = map.get(item) ?? 0;
    map.set(item, count + 1);
    rolls.push(item);
  }

  const maxVal = Math.max(...map.values());
  const maxKey = [...map.entries()].find(([, val]) => val === maxVal)?.[0] ??
    arr[0];

  return [maxKey, maxVal, rolls] as const;
};

export const getRollsSum = (rolls: number[]) =>
  rolls.reduce((acc, v) => acc += STAKE_PRICE[v] ?? 0, 0);

export const getPrize = (
  maxFrequent: number,
  maxFrequency: number,
  rolls: number[],
) =>
  match([STICKERS[maxFrequent], maxFrequency])
    .with(["seven", 3], () => 77)
    .with(["lemon", 3], () => 30)
    .with(["cherry", 3], () => 23)
    .with(["bar", 3], () => 21)
    .with([P._, 2], () => 4 + getRollsSum(rolls))
    .otherwise(() => getRollsSum(rolls) - 3);

export const getFreespinCode = async (userId: number) => {
  if (Math.random() <= FREECODE_PROB) {
    const code = await createFreespinCode(userId);
    return `\n<i>Кстати, кто-то кроме тебя может применить этот подарочный код через \n<code>/redeem ${code}</code> (тык),\nи получить круточку бесплатно (в личку). \nКто же окажется самым быстрым?</i>`;
  }
  return undefined;
};
