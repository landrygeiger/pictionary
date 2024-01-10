import { Session } from "@pictionary/shared";
import { match } from "ts-pattern";
import * as E from "fp-ts/Either";
import * as A from "fp-ts/Array";
import { SessionError, sessionError } from "@pictionary/shared/dist/error";
import { flow, pipe } from "fp-ts/lib/function";

const newSession = (ownerName: string): Session => ({
  state: "lobby",
  players: [{ name: ownerName, owner: true }],
});

type SessionAction = JoinAction;

type JoinAction = {
  kind: "join";
  playerName: string;
};

type LeaveAction = {
  kind: "leave";
  playerName: string;
};

const hasPlayer = (session: Session) => (playerName: string) =>
  pipe(
    session.players,
    A.exists((p) => p.name === playerName)
  );

const addPlayer = (session: Session) =>
  flow(
    E.fromPredicate(hasPlayer(session), () =>
      sessionError("That name is already in use.")
    ),
    E.map((playerName) => ({
      ...session,
      players: [...session.players, { name: playerName, owner: false }],
    }))
  );

const reduceJoin = (session: Session) => (action: JoinAction) =>
  match(session)
    .with({ state: "lobby" }, () => addPlayer(session)(action.playerName))
    .exhaustive();

const sessionReducer =
  (action: SessionAction) =>
  (prev: Session): E.Either<SessionError, Session> =>
    match(action).with({ kind: "join" }, reduceJoin(prev)).exhaustive();
