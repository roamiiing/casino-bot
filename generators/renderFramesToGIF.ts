import {
  Frame,
  GIF,
  Image,
} from "https://deno.land/x/imagescript@1.2.15/mod.ts";

export type RenderOptions = { width: number; height: number };

export const renderFramesToGIF = async (
  images: Uint8Array[],
  options: RenderOptions,
) => {
  const frames = (await Promise.all(images.map((imageBuffer) => {
    const img = new Image(options.width, options.height);
    img.bitmap.set(imageBuffer);
    return img;
  })))
    .map((image) => Frame.from(image, 16));

  const gif = new GIF(frames, 0);

  return gif.encode();
};
