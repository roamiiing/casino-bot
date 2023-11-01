import { KV_URL } from "./constants.ts";

console.log("kv url", KV_URL);
export const kv = await Deno.openKv(KV_URL);
