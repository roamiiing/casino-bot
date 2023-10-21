export type UserState = {
  displayName: string;
  coins: number;
  lastDayUtc: number;
  attemptCount: number;
  extraAttempts?: number;
};
