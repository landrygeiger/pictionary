import {
  BetweenSessionState,
  RoundSessionState,
  SessionError,
  config,
  sessionError,
} from "@pictionary/shared";
import * as E from "fp-ts/Either";
import { performTick } from "../../src/session-state";

describe("performTick", () => {
  it("errors when given an invalid token", () => {
    const session: RoundSessionState = {
      state: "round",
      timeLeft: 24,
      timerToken: "valid-token",
      word: "beans",
      messages: [],
      players: [],
    };

    const result = performTick(session)("new beans")("invalid-token");

    const expected: E.Either<SessionError, never> = E.left(
      sessionError("Invalid timer token."),
    );

    expect(result).toEqual(expected);
  });

  it("ticks a session that isn't at time left = 1", () => {
    const session: BetweenSessionState = {
      state: "between",
      timeLeft: 12,
      timerToken: "valid-token",
      players: [],
      messages: [],
    };

    const result = performTick(session)("egg")("valid-token");

    const expected: E.Either<never, BetweenSessionState> = E.right({
      state: "between",
      timeLeft: 11,
      timerToken: "valid-token",
      players: [],
      messages: [],
    });

    expect(result).toEqual(expected);
  });

  it("transitions a between into a round", () => {
    const token = "valid-token";
    const newWord = "egg";

    const session: BetweenSessionState = {
      state: "between",
      timeLeft: 1,
      timerToken: token,
      messages: [],
      players: [
        {
          name: "bill",
          socketId: "test-socket-id",
          owner: true,
          drawing: false,
          guessedWord: true,
          score: 0,
        },
      ],
    };

    const result = performTick(session)(newWord)(token);

    const expected: E.Either<never, RoundSessionState> = E.right({
      state: "round",
      timeLeft: config.roundLength,
      timerToken: token,
      word: newWord,
      players: [
        {
          name: "bill",
          socketId: "test-socket-id",
          owner: true,
          drawing: true,
          guessedWord: false,
          score: 0,
        },
      ],
      messages: [],
    });

    expect(result).toEqual(expected);
  });

  it("transitions a round into a between", () => {
    const token = "valid-token";
    const newWord = "egg";

    const session: RoundSessionState = {
      state: "round",
      timeLeft: 1,
      word: "beanburrito",
      messages: [],
      timerToken: token,
      players: [],
    };

    const result = performTick(session)(newWord)(token);

    const expected: E.Either<never, BetweenSessionState> = E.right({
      state: "between",
      timeLeft: config.betweenLength,
      timerToken: token,
      messages: [],
      word: "beanburrito",
      players: [],
    });

    expect(result).toEqual(expected);
  });
});
