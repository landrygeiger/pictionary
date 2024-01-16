import {
  BETWEEN_LENGTH,
  BetweenSessionState,
  ROUND_LENGTH,
  RoundSessionState,
  SessionError,
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
    };

    const result = performTick(session)("egg")("valid-token");

    const expected: E.Either<never, BetweenSessionState> = E.right({
      state: "between",
      timeLeft: 11,
      timerToken: "valid-token",
      players: [],
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
      players: [],
    };

    const result = performTick(session)(newWord)(token);

    const expected: E.Either<never, RoundSessionState> = E.right({
      state: "round",
      timeLeft: ROUND_LENGTH,
      timerToken: token,
      word: newWord,
      players: [],
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
      timerToken: token,
      players: [],
    };

    const result = performTick(session)(newWord)(token);

    const expected: E.Either<never, BetweenSessionState> = E.right({
      state: "between",
      timeLeft: BETWEEN_LENGTH,
      timerToken: token,
      word: "beanburrito",
      players: [],
    });

    expect(result).toEqual(expected);
  });
});