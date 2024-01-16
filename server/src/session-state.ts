import {
  Session,
  SessionError,
  not,
  sessionError,
  removePlayerKeepListOwned,
  RoundSessionState,
  BetweenSessionState,
  newRoundFromSession,
  tickOneSecondFromSession,
  betweenFromSession,
  newPlayer,
  endingSession,
  didGuessWord,
  Player,
  updatePlayerInList,
  calcScoreFromGuess,
  updatePlayerInSessionIfCorrectGuess,
  Message,
  allPlayersGuessedWord,
} from "@pictionary/shared";
import { match } from "ts-pattern";
import * as E from "fp-ts/Either";
import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/lib/function";
import { v4 as uuidv4 } from "uuid";

export const newSessionId = uuidv4;
export const newTimerToken = uuidv4;

type SessionAction =
  | JoinAction
  | LeaveAction
  | StartBetweenAction
  | TickAction
  | GuessAction;

type JoinAction = {
  kind: "join";
  playerName: string;
  socketId: string;
};

type LeaveAction = {
  kind: "leave";
  socketId: string;
};

type StartBetweenAction = {
  kind: "start-between";
  timerToken: string;
};

type TickAction = {
  kind: "tick";
  timerToken: string;
  newWord: string;
};

type GuessAction = {
  kind: "guess";
  guess: string;
  socketId: string;
  newTimerToken: string;
};

const hasPlayerWithName = (session: Session) => (playerName: string) =>
  pipe(
    session.players,
    A.exists(p => p.name === playerName),
  );

const hasPlayerWithSocket = (session: Session) => (socketId: string) =>
  pipe(
    session.players,
    A.exists(p => p.socketId === socketId),
  );

const isValidTimerToken =
  (timerToken: string) => (session: RoundSessionState | BetweenSessionState) =>
    session.timerToken === timerToken;

const hideGuessIfCorrect =
  (session: Session) => (player: Player) => (guess: string) =>
    didGuessWord(session)(guess)
      ? `${player.name} has guessed the word!`
      : guess;

const messageFromGuess =
  (correct: boolean) =>
  (player: Player) =>
  (guess: string): Message => ({
    kind: correct ? "correct" : "guess",
    message: correct ? `${player.name} has guessed the word!` : guess,
    playerName: player.name,
  });

export const getPlayerBySocketId = (session: Session) => (socketId: string) =>
  pipe(
    session.players,
    A.findFirst(p => p.socketId === socketId),
    E.fromOption(() =>
      sessionError("A player with that socket id could not be found."),
    ),
  );

export const performAddPlayer =
  (session: Session) =>
  (socketId: string) =>
  (playerName: string): E.Either<SessionError, Session> =>
    pipe(
      playerName,
      E.fromPredicate(not(hasPlayerWithName(session)), () =>
        sessionError("That name is already in use."),
      ),
      E.filterOrElse(
        () => !hasPlayerWithSocket(session)(socketId),
        () => sessionError("That socket is already in the session."),
      ),
      E.map(playerName => ({
        ...session,
        players: [...session.players, newPlayer(socketId, playerName)],
      })),
    );

export const performRemovePlayer =
  (session: Session) =>
  (socketId: string): E.Either<SessionError, Session> =>
    pipe(
      socketId,
      getPlayerBySocketId(session),
      E.map(removePlayerKeepListOwned(session.players)),
      E.map(
        (players): Session => ({
          ...session,
          players,
        }),
      ),
      E.map(session =>
        A.isEmpty(session.players) ? endingSession(session) : session,
      ),
    );

export const performStartBetween =
  (session: Session) =>
  (timerToken: string): E.Either<never, Session> =>
    E.right(betweenFromSession(session)(timerToken));

export const performNewRound =
  (session: Session) =>
  (word: string) =>
  (timerToken: string): E.Either<never, Session> =>
    E.right(newRoundFromSession(session)(word)(timerToken));

export const performTick =
  (session: RoundSessionState | BetweenSessionState) =>
  (word: string) =>
  (timerToken: string): E.Either<SessionError, Session> =>
    pipe(
      session,
      E.fromPredicate(isValidTimerToken(timerToken), () =>
        sessionError("Invalid timer token."),
      ),
      E.map(
        (session): Session =>
          session.timeLeft === 1 && session.state === "round"
            ? betweenFromSession(session)(timerToken)
            : session.timeLeft === 1 && session.state === "between"
            ? newRoundFromSession(session)(word)(timerToken)
            : tickOneSecondFromSession(session),
      ),
    );

export const performGuess =
  (session: RoundSessionState) =>
  (guess: string) =>
  (socketId: string) =>
  (newTimerToken: string) =>
    pipe(
      E.Do,
      E.let("correct", () => didGuessWord(session)(guess)),
      E.bind("player", () => getPlayerBySocketId(session)(socketId)),
      E.map(
        ({ correct, player }): RoundSessionState => ({
          ...updatePlayerInSessionIfCorrectGuess(session)(correct)(player),
          messages: [
            ...session.messages,
            messageFromGuess(correct)(player)(guess),
          ],
        }),
      ),
      E.map(session =>
        allPlayersGuessedWord(session)
          ? betweenFromSession(session)(newTimerToken)
          : session,
      ),
    );

export const performMessage =
  (session: Session) => (message: string) => (socketId: string) =>
    pipe(
      getPlayerBySocketId(session)(socketId),
      E.map(
        (player): Session => ({
          ...session,
          messages: [
            ...session.messages,
            { playerName: player.name, message, kind: "guess" },
          ],
        }),
      ),
    );

const handleJoinAction = (session: Session) => (action: JoinAction) =>
  match(session)
    .with({ state: "lobby" }, { state: "between" }, { state: "round" }, () =>
      performAddPlayer(session)(action.socketId)(action.playerName),
    )
    .with({ state: "ending" }, () =>
      E.left(sessionError("An ending session cannot be joined.")),
    )
    .exhaustive();

const handleLeaveAction = (session: Session) => (action: LeaveAction) =>
  match(session)
    .with({ state: "lobby" }, { state: "between" }, { state: "round" }, () =>
      performRemovePlayer(session)(action.socketId),
    )
    .with({ state: "ending" }, () =>
      E.left(sessionError("An ending session cannot be left.")),
    )
    .exhaustive();

const handleStartBetweenAction =
  (session: Session) => (action: StartBetweenAction) =>
    match(session)
      .with({ state: "lobby" }, { state: "between" }, { state: "round" }, () =>
        performStartBetween(session)(action.timerToken),
      )
      .with({ state: "ending" }, () =>
        E.left(sessionError("An ending session cannot be started.")),
      )
      .exhaustive();

const handleTickAction = (session: Session) => (action: TickAction) =>
  match(session)
    .with({ state: "between" }, { state: "round" }, session =>
      performTick(session)(action.newWord)(action.timerToken),
    )
    .with({ state: "ending" }, { state: "lobby" }, () =>
      E.left(
        sessionError(
          "Cannot perform tick on session in lobby or ending state.",
        ),
      ),
    )
    .exhaustive();

const handleGuessAction = (session: Session) => (action: GuessAction) =>
  match(session)
    .with({ state: "round" }, session =>
      performGuess(session)(action.guess)(action.socketId)(
        action.newTimerToken,
      ),
    )
    .with({ state: "between" }, { state: "lobby" }, { state: "ending" }, () =>
      performMessage(session)(action.guess)(action.socketId),
    )
    .exhaustive();

export const reduceSession =
  (action: SessionAction) =>
  (prev: Session): E.Either<SessionError, Session> =>
    match(action)
      .with({ kind: "join" }, handleJoinAction(prev))
      .with({ kind: "leave" }, handleLeaveAction(prev))
      .with({ kind: "start-between" }, handleStartBetweenAction(prev))
      .with({ kind: "tick" }, handleTickAction(prev))
      .with({ kind: "guess" }, handleGuessAction(prev))
      .exhaustive();
