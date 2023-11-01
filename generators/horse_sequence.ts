import { crypto } from "https://deno.land/std@0.202.0/crypto/crypto.ts";
import { random, round } from "./utils.ts";

export type Stakes = Record<number, number>;
export type Koefs = Record<number, number>;

export const getKs = (stakes: Stakes) => {
  const sum = Object.values(stakes).reduce<number>(
    (acc, stake) => acc + stake,
    0,
  );

  const ks = Object.fromEntries(
    Object.entries(stakes).map(([key, value]) => {
      return [key, Math.floor((sum - value) / (1.1 * value) * 1000) / 1000 + 1];
    }),
  );
  return ks;
};

// places generator
export const genPlaces = (horseCount: number) => {
  const array = new Uint8Array(1);
  crypto.getRandomValues(array);
  return array[0] % horseCount;
};

// median time / distance / vel
const baseVelocity = 0.30;
const maxDeviation = 0.3 * baseVelocity;
const distance = 100;

const createDataSeries = (
  distance: number,
  velocity: number,
  deviation: number,
) => {
  let prevSpeed = velocity;
  let sum = 0;
  const series: number[] = [velocity];
  while (sum < distance) {
    const newSpeed = Math.min(
      velocity + deviation,
      Math.max(
        velocity - deviation,
        round(prevSpeed + (random() - 0.5) * 2 * deviation, 3),
      ),
    );
    sum += newSpeed;
    series.push(newSpeed);
    prevSpeed = newSpeed;
  }

  return series;
};

// speed function generation
export const createSpeeds = (horsesCount: number, winnerPosition: number) => {
  const serieses = Array.from(
    { length: horsesCount },
    () => createDataSeries(distance, baseVelocity, maxDeviation),
  );
  const actualWinnerId =
    serieses.map((s, id) => ({ len: s.length, id })).toSorted((s1, s2) =>
      s1.len - s2.len
    )[0].id;

  const tempSeries = serieses[actualWinnerId];
  serieses[actualWinnerId] = serieses[winnerPosition];
  serieses[winnerPosition] = tempSeries;
  return serieses;
};

// drawing frame-by-frame
// gif building

if (import.meta.main) {
  console.log("Horses");
  const winner = genPlaces(4);
  console.log(winner);
  const stakes = {
    0: 1,
    1: 10000,
    2: 1,
    3: 1,
  };
  const ks = getKs(stakes);
  console.log(stakes, ks);
  console.log(createSpeeds(4, winner).map((s) => s.length));
}
