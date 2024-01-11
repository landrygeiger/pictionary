import {
  Session,
  SessionError,
  isEmptyArr,
  not,
  notFoundError,
  playerEq,
  removePlayerFromList,
  sessionError,
} from "@pictionary/shared";
import { match } from "ts-pattern";
import * as E from "fp-ts/Either";
import * as A from "fp-ts/Array";
import * as B from "fp-ts/boolean";
import { flip, flow, identity, pipe } from "fp-ts/lib/function";
import { v4 as uuidv4 } from "uuid";
import {
  promoteFirstPlayer,
  removePlayerKeepListOwned,
} from "@pictionary/shared/dist/session";

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

const getPlayer = (session: Session) => (playerName: string) =>
  pipe(
    session.players,
    A.findFirst((p) => p.name === playerName),
    E.fromOption(() =>
      sessionError("A player with that name could not be found.")
    )
  );

const performAddPlayer = (session: Session) =>
  flow(
    E.fromPredicate(not(hasPlayer(session)), () =>
      sessionError("That name is already in use.")
    ),
    E.map((playerName) => ({
      ...session,
      players: [...session.players, { name: playerName, owner: false }],
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
      performAddPlayer(session)(action.playerName)
    )
    .with({ state: "ending" }, () =>
      E.left(sessionError("An ending session cannot be joined."))
    )
    .exhaustive();

const handleLeaveAction = (session: Session) => (action: LeaveAction) =>
  match(session)
    .with({ state: "lobby" }, () =>
      performRemovePlayer(session)(action.playerName)
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
