import { createCanvas } from "https://deno.land/x/canvas/mod.ts";
import { createSpeeds } from "./horse_sequence.ts";
import { renderFramesToGIF } from "./renderFramesToGIF.ts";

const WIDTH = 500;
const ITER_COUNT = 100;

const Y_PADDING = 50;
const START_X = 30, START_Y = 30;
const RADIUS = 10;

const MENU_WIDTH = 140;

const MODIFIER = (WIDTH - 2 * START_X - MENU_WIDTH) / ITER_COUNT;

const COLORS = [
  "#f87171",
  "#fb923c",
  "#fbbf24",
  "#facc15",
  "#a3e635",
  "#4ade80",
  "#059669",
  "#2dd4bf",
  "#22d3ee",
  "#818cf8",
  "#c084fc",
  "#e879f9",
  "#ec4899",
  "#fb7185",
];

const getColor = (i: number) => {
  return COLORS.at(i % 2 ? i : -i);
};

class Horse {
  x: number;
  y: number;
  style: string;
  distance = 0;
  place?: number;

  constructor(_x: number, _y: number, _style: string) {
    this.x = _x;
    this.y = _y;
    this.style = _style;
  }

  add(velocity: number, mod: number) {
    this.distance += velocity;
    this.x += velocity * mod;
  }

  setPlace(place: number) {
    if (!this.place) this.place = place;
  }
}

export const drawHorses = (series: number[][]) => {
  const HEIGHT = 2 * START_Y + (series.length - 1) * Y_PADDING;

  const buffers: Uint8Array[] = [];
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  const maxFrames =
    series.map((ser) => ser.length).toSorted((s1, s2) => s2 - s1)[0] + 10;

  const horses = Array.from(
    { length: series.length },
    (_, i) =>
      new Horse(START_X, START_Y + Y_PADDING * i, getColor(i) ?? "#0a0a0a"),
  );

  let currentPlace = 1;

  for (let frameId = 0; frameId < maxFrames; frameId++) {
    // console.log("Rendering frame:", frameId, "of", maxFrames);
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    for (let horseId = 0; horseId < horses.length; horseId++) {
      const { x, y, style, distance, place } = horses[horseId];

      ctx.beginPath();
      ctx.moveTo(START_X, y);
      ctx.lineTo(WIDTH - MENU_WIDTH - START_X, y);
      ctx.fillStyle = "rgb(40,40,40)";
      ctx.strokeStyle = "rgb(40,40,40)";
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = style;
      ctx.strokeStyle = style;
      ctx.moveTo(START_X, y);
      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = style;
      ctx.arc(x, y, RADIUS, 0, 2 * Math.PI);
      ctx.fill();

      ctx.font = "14px monospace";
      ctx.fillStyle = `rgb(255,255,255)`;
      ctx.fillText(
        `${horseId + 1}`,
        x - 4,
        y + 5,
      );

      const distToRender = Math.min(distance, 100).toFixed(1);

      ctx.font = "16px monospace";
      ctx.fillStyle = style;
      ctx.fillText(
        `${distToRender}%`,
        WIDTH - MENU_WIDTH - START_X + 30,
        y + 5,
      );

      const velocity = series[horseId].at(frameId) ?? 0;
      if (velocity) {
        horses[horseId].add(velocity, MODIFIER);
      }

      if (distance >= 100 && !place) {
        horses[horseId].setPlace(currentPlace);
        currentPlace += 1;
      }

      if (place) {
        ctx.font = "bold 16px monospace";
        const colorShade = Math.min((place - 1) * 15, 170).toFixed(0);
        ctx.fillStyle = `rgb(${Array(3).fill(colorShade).join(",")})`;
        ctx.fillText(
          place.toFixed(0),
          WIDTH - START_X - 12,
          y + 5,
        );
      }
    }

    buffers.push(canvas.toBuffer());
  }

  return { buffers, height: HEIGHT, width: WIDTH };
};

if (import.meta.main) {
  console.log("draw");
  const { buffers, height, width } = drawHorses(createSpeeds(4, 0));
  Deno.writeFile(`last.png`, buffers.at(-1)!, { create: true });
  const gifBuffer = await renderFramesToGIF(buffers, { height, width });
  Deno.writeFile("file.gif", gifBuffer, { create: true });
}
