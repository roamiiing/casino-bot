const GAS_DEFAULT = 0.0285; // 2.85%
// 9.999999999999876 0.285

const roundValue = (x: number) => {
  return Math.round(x);
};

// 0 - 10 | 10+
// ___--  | ----

const gasFunction = (x: number) => {
  return Math.max(0.001, (((x + 1) ** Math.log10(x + 1)) - 1) / 39.15);
};

export const getGasTax = (tradeVolume: number) => {
  if (tradeVolume < 10) {
    return roundValue(gasFunction(tradeVolume));
  }
  return roundValue(tradeVolume * GAS_DEFAULT);
};

if (import.meta.main) {
  for (let i = 0; i <= 200_00; i += 50) {
    console.log(i, getGasTax(i));
  }
}
