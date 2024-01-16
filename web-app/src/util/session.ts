import { Session } from "@pictionary/shared";
import { match } from "ts-pattern";

export const getStatusMessage = (session: Session) =>
  match(session)
    .with({ state: "lobby" }, () => "Waiting to start...")
    .with({ state: "ending" }, () => "Session ending...")
    .with(
      { state: "between" },
      session => `Next round starting in ${session.timeLeft}...`,
    )
    .with(
      { state: "round" },
      session => `Round ending in ${session.timeLeft}...`,
    )
    .exhaustive();
