import "https://deno.land/x/dotenv@v3.2.2/load.ts";

export const BOT_TOKEN = Deno.env.get("BOT_TOKEN") ?? "";

export const KV_URL = Deno.env.get("KV_URL") ?? "";

if (!KV_URL.length) {
  throw new Error("KV_URL is not defined");
}

export const CURRENT_KEY = Deno.env.get("CURRENT_KEY") ||
  "users-testing-v47238";

export const ATTEMPTS_LIMIT = parseInt(
  Deno.env.get("ATTEMPTS_LIMIT") || "3",
  10,
);

export const IS_PRODUCTION = Deno.env.get("IS_PRODUCTION") === "true";

export const DICE_COST = 7;
export const CASINO_DICE = "🎰";

export const FREECODE_PROB = Number(Deno.env.get("FREECODE_PROB") ?? 0.15);

export const ADMINS = (Deno.env.get("ADMINS") ?? "").split(",").filter((v) =>
  v.length
);
