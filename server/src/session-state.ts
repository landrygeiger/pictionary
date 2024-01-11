import {
  Session,
  SessionError,
  isEmptyArr,
  not,
  sessionError,
  Player,
} from "@pictionary/shared";
import { match } from "ts-pattern";
import * as E from "fp-ts/Either";
import * as A from "fp-ts/Array";
import { flow, pipe } from "fp-ts/lib/function";
import { v4 as uuidv4 } from "uuid";
import { removePlayerKeepListOwned } from "@pictionary/shared/dist/session";

export const newSession = (
  ownerSocketId: string,
  ownerName: string
): Session => ({
  state: "lobby",
  players: [{ socketId: ownerSocketId, name: ownerName, owner: true }],
});

const newPlayer = (socketId: string, name: string): Player => ({
  socketId,
  name,
  owner: false,
});

export const newSessionId = uuidv4;

type SessionAction = JoinAction | LeaveAction;

type JoinAction = {
  kind: "join";
  playerName: string;
  socketId: string;
};

type LeaveAction = {
  kind: "leave";
  socketId: string;
};

const hasPlayerWithName = (session: Session) => (playerName: string) =>
  pipe(
    session.players,
    A.exists((p) => p.name === playerName)
  );

const hasPlayerWithSocket = (session: Session) => (socketId: string) =>
  pipe(
    session.players,
    A.exists((p) => p.socketId === socketId)
  );

const getPlayer = (session: Session) => (socketId: string) =>
  pipe(
    session.players,
    A.findFirst((p) => p.socketId === socketId),
    E.fromOption(() =>
      sessionError("A player with that name could not be found.")
    )
  );

export const performAddPlayer = (session: Session) => (socketId: string) =>
  flow(
    E.fromPredicate(not(hasPlayerWithName(session)), () =>
      sessionError("That name is already in use.")
    ),
    E.filterOrElse(
      () => !hasPlayerWithSocket(session)(socketId),
      () => sessionError("That socket is already in the session.")
    ),
    E.map((playerName) => ({
      ...session,
      players: [...session.players, newPlayer(socketId, playerName)],
    }))
  );

const performRemovePlayer = (session: Session) =>
  flow(
    getPlayer(session),
    E.map(removePlayerKeepListOwned(session.players)),
    E.map(
      (players): Session => ({
        ...session,
        players,
        state: isEmptyArr(players) ? "ending" : session.state,
      })
    )
  );

const handleJoinAction = (session: Session) => (action: JoinAction) =>
  match(session)
    .with({ state: "lobby" }, () =>
      performAddPlayer(session)(action.socketId)(action.playerName)
    )
    .with({ state: "ending" }, () =>
      E.left(sessionError("An ending session cannot be joined."))
    )
    .exhaustive();

const handleLeaveAction = (session: Session) => (action: LeaveAction) =>
  match(session)
    .with({ state: "lobby" }, () =>
      performRemovePlayer(session)(action.socketId)
    )
    .with({ state: "ending" }, () =>
      E.left(sessionError("An ending session cannot be left."))
    )
    .exhaustive();

export const reduceSession =
  (action: SessionAction) =>
  (prev: Session): E.Either<SessionError, Session> =>
    match(action)
      .with({ kind: "join" }, handleJoinAction(prev))
      .with({ kind: "leave" }, handleLeaveAction(prev))
      .exhaustive();
