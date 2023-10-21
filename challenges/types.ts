export type ChallengeCreated<ChallengeContent, RejectionReason = string> = {
  status: true;
  challenge: ChallengeContent;
} | {
  status: false;
  description: RejectionReason;
};
