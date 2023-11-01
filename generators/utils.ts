export const computeIntegral = (series: number[], delta: number) => {
  return series.reduce<number>((sum, height) => sum + height * delta, 0);
};

export const round = (n: number, decimals: number) =>
  Math.round(n * (10 ** decimals)) / (10 ** decimals);

export const random = () => {
  const array = new Uint16Array(1);
  crypto.getRandomValues(array);
  return array[0] / 65535; // MAX 16 bit unsigned integer
};
