import { Session } from "@pictionary/shared";
import { match } from "ts-pattern";

export const getStatusMessage = (session: Session) =>
  match(session)
    .with({ state: "lobby" }, () => "Waiting to start...")
    .with({ state: "ending" }, () => "Session ending...")
    .exhaustive();
