import * as A from "fp-ts/Array";
import * as S from "fp-ts/string";
import * as B from "fp-ts/boolean";
import { not } from "./pure-util";
import * as O from "fp-ts/Option";
import { flip, identity, pipe } from "fp-ts/lib/function";
import { config } from "./config";

const states = ["lobby", "ending", "round", "between"] as const;

export type Session =
  | LobbySessionState
  | EndingSessionState
  | RoundSessionState
  | BetweenSessionState;

export type LobbySessionState = {
  state: (typeof states)[0];
  players: Player[];
};

export type EndingSessionState = {
  state: (typeof states)[1];
  players: Player[];
};

export type RoundSessionState = {
  state: (typeof states)[2];
  timeLeft: number;
  timerToken: string;
  word: string;
  players: Player[];
};

export type BetweenSessionState = {
  state: (typeof states)[3];
  timeLeft: number;
  timerToken: string;
  players: Player[];
};

export type Player = {
  name: string;
  owner: boolean;
  socketId: string;
  guessedWord: boolean;
  score: number;
};

export const playerEq = (p1: Player) => (p2: Player) =>
  S.Eq.equals(p1.name, p2.name) &&
  B.Eq.equals(p1.owner, p2.owner) &&
  S.Eq.equals(p1.socketId, p2.socketId);

export const removePlayerFromList = (p: Player) => A.filter(not(playerEq(p)));

const promotePlayer = (p: Player): Player => ({ ...p, owner: true });

export const promoteFirstPlayer = (ps: Player[]) => [
  ...pipe(
    ps,
    A.head,
    O.match(
      () => [],
      p => [promotePlayer(p)],
    ),
  ),
  ...pipe(
    ps,
    A.tail,
    O.match(() => [], identity),
  ),
];

export const removePlayerKeepListOwned = (ps: Player[]) => (p: Player) =>
  pipe(
    p,
    flip(removePlayerFromList)(ps),
    p.owner ? promoteFirstPlayer : identity,
  );

export const filterSessionsInState = (state: (typeof states)[number]) =>
  A.filter((session: Session) => session.state === state);

export const newRoundFromSession =
  (session: Session) =>
  (word: string) =>
  (timerToken: string): RoundSessionState => ({
    ...session,
    state: "round",
    word,
    timerToken,
    timeLeft: config.roundLength,
  });

export const betweenFromSession =
  (session: Session) =>
  (timerToken: string): BetweenSessionState => ({
    ...session,
    state: "between",
    timerToken,
    timeLeft: config.betweenLength,
  });

export const tickOneSecondFromSession = (
  session: RoundSessionState | BetweenSessionState,
): RoundSessionState | BetweenSessionState => ({
  ...session,
  timeLeft: session.timeLeft - 1,
});

export const newSession = (
  ownerSocketId: string,
  ownerName: string,
): Session => ({
  state: "lobby",
  players: [
    {
      socketId: ownerSocketId,
      name: ownerName,
      owner: true,
      score: 0,
      guessedWord: false,
    },
  ],
});

export const endingSession = (session: Session): Session => ({
  ...session,
  state: "ending",
});

export const newPlayer = (socketId: string, name: string): Player => ({
  socketId,
  name,
  owner: false,
  score: 0,
  guessedWord: false,
});
