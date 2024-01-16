import * as Ord from "fp-ts/Ord";
import * as N from "fp-ts/number";
import * as A from "fp-ts/Array";
import * as S from "fp-ts/string";
import * as B from "fp-ts/boolean";
import { not, randomElement } from "./pure-util";
import * as O from "fp-ts/Option";
import { flip, identity, pipe } from "fp-ts/lib/function";
import { config } from "./config";
import { randomElem } from "fp-ts/lib/Random";

const states = ["lobby", "ending", "round", "between"] as const;

export type Session =
  | LobbySessionState
  | EndingSessionState
  | RoundSessionState
  | BetweenSessionState;

export type LobbySessionState = {
  state: (typeof states)[0];
  players: Player[];
  messages: Message[];
};

export type EndingSessionState = {
  state: (typeof states)[1];
  players: Player[];
  messages: Message[];
};

export type RoundSessionState = {
  state: (typeof states)[2];
  timeLeft: number;
  timerToken: string;
  word: string;
  players: Player[];
  messages: Message[];
};

export type BetweenSessionState = {
  state: (typeof states)[3];
  timeLeft: number;
  timerToken: string;
  players: Player[];
  messages: Message[];
};

export type Player = {
  name: string;
  owner: boolean;
  socketId: string;
  guessedWord: boolean;
  score: number;
  drawing: boolean;
};

export type Message = {
  message: string;
  playerName: string;
  kind: "correct" | "guess";
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

export const updatePlayerInList = (ps: Player[]) => (p: Player) =>
  [...A.filter(not(playerEq(p)))(ps), p];

const getDrawer = (ps: Player[]) =>
  pipe(
    ps,
    A.findFirst(p => p.drawing),
  );

export const setPlayersGuessedFalse = (ps: Player[]) =>
  ps.map(p => ({ ...p, guessedWord: false }));

export const setPlayersDrawingFalse = (ps: Player[]) =>
  ps.map(p => ({ ...p, drawing: false }));

export const numGuessedWord = (ps: Player[]) =>
  pipe(
    ps,
    A.filter(p => p.guessedWord),
    A.size,
  );

export const filterSessionsInState = (state: (typeof states)[number]) =>
  A.filter((session: Session) => session.state === state);

export const chooseNewDrawer = (session: Session) =>
  pipe(
    session.players,
    setPlayersDrawingFalse,
    randomElement,
    p => ({
      ...p,
      drawing: true,
    }),
    updatePlayerInList(session.players),
  );

export const newRoundFromSession =
  (session: Session) =>
  (word: string) =>
  (timerToken: string): RoundSessionState => ({
    ...session,
    state: "round",
    word,
    players: pipe(session, chooseNewDrawer, setPlayersGuessedFalse),
    timerToken,
    timeLeft: config.roundLength,
    messages: [],
  });

export const updateDrawerAfterRound = (session: RoundSessionState) =>
  pipe(
    session.players,
    getDrawer,
    O.map(p =>
      updatePlayerInList(session.players)({
        ...p,
        score: p.score + calcScoreAfterDrawing(session),
      }),
    ),
    O.getOrElse(() => session.players),
  );

export const betweenFromSession =
  (session: Session) =>
  (timerToken: string): BetweenSessionState => ({
    ...session,
    state: "between",
    timerToken,
    timeLeft: config.betweenLength,
    players:
      session.state === "round"
        ? updateDrawerAfterRound(session)
        : session.players,
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
      drawing: false,
    },
  ],
  messages: [],
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
  drawing: false,
});

export const byScore = Ord.contramap((p: Player) => p.score)(N.Ord);

export const didGuessWord = (session: Session) => (guess: string) =>
  session.state === "round" &&
  session.word.toLocaleLowerCase() === guess.toLocaleLowerCase();

export const calcScoreFromGuess = (session: RoundSessionState) =>
  Math.floor((config.maxScorePerGuess * session.timeLeft) / config.roundLength);

export const calcScoreAfterDrawing = (session: RoundSessionState) =>
  Math.floor(
    (config.maxScorePerGuess * numGuessedWord(session.players)) /
      session.players.length,
  );

export const updatePlayerInSessionIfCorrectGuess =
  (session: RoundSessionState) =>
  (correct: boolean) =>
  (player: Player): RoundSessionState => ({
    ...session,
    players: updatePlayerInList(session.players)({
      ...player,
      guessedWord: correct,
      score:
        correct && !player.guessedWord && !player.drawing
          ? calcScoreFromGuess(session) + player.score
          : player.score,
    }),
  });

export const allPlayersGuessedWord = (session: Session) =>
  pipe(
    session.players,
    A.every(player => player.guessedWord),
  );
