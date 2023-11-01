import { KV_URL } from "./constants.ts";

export const kv = await Deno.openKv(KV_URL);
