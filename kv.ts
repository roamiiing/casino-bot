import { IS_PRODUCTION, KV_URL } from "./constants.ts";

console.log("kv url", KV_URL);
export const kv = await Deno.openKv(IS_PRODUCTION ? KV_URL : undefined);
