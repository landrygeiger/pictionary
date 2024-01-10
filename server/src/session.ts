import { Session, SessionError, not, sessionError } from "@pictionary/shared";
import { match } from "ts-pattern";
import * as E from "fp-ts/Either";
import * as A from "fp-ts/Array";
import { flow, pipe } from "fp-ts/lib/function";
import { v4 as uuidv4 } from "uuid";

export const newSession = (ownerName: string): Session => ({
  state: "lobby",
  players: [{ name: ownerName, owner: true }],
});

export const newSessionId = uuidv4;

type SessionAction = JoinAction | LeaveAction;

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
    E.fromPredicate(not(hasPlayer(session)), () =>
      sessionError("That name is already in use.")
    ),
    E.map((playerName) => ({
      ...session,
      players: [...session.players, { name: playerName, owner: false }],
    }))
  );

const removePlayer = (session: Session) =>
  flow(
    E.fromPredicate(hasPlayer(session), () =>
      sessionError("A player with that name could not be found.")
    ),
    E.map((playerName) => ({
      ...session,
      players: session.players.filter((p) => p.name !== playerName),
    }))
  );

const handleJoinAction = (session: Session) => (action: JoinAction) =>
  match(session)
    .with({ state: "lobby" }, () => addPlayer(session)(action.playerName))
    .exhaustive();

const handleLeaveAction = (session: Session) => (action: LeaveAction) =>
  match(session)
    .with({ state: "lobby" }, () => removePlayer(session)(action.playerName))
    .exhaustive();

export const reduceSession =
  (action: SessionAction) =>
  (prev: Session): E.Either<SessionError, Session> =>
    match(action)
      .with({ kind: "join" }, handleJoinAction(prev))
      .with({ kind: "leave" }, handleLeaveAction(prev))
      .exhaustive();
