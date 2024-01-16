import * as E from "fp-ts/Either";
import { Session, SessionError, sessionError } from "@pictionary/shared";
import { performAddPlayer } from "../../src/session-state";

describe("performAddPlayer", () => {
  it("adds the player", () => {
    const socketId = "test-socket-id-3";
    const playerName = "Test Player 3";

    const s: Session = {
      state: "lobby",
      messages: [],
      players: [
        {
          name: "Test Player 1",
          socketId: "test-socket-id-1",
          owner: true,
          score: 0,
          guessedWord: false,
        },
        {
          name: "Test Player 2",
          socketId: "test-socket-id-2",
          owner: false,
          score: 0,
          guessedWord: false,
        },
      ],
    };

    const result = performAddPlayer(s)(socketId)(playerName);

    const expected: E.Either<never, Session> = E.right({
      state: "lobby",
      messages: [],
      players: [
        {
          name: "Test Player 1",
          socketId: "test-socket-id-1",
          owner: true,
          score: 0,
          guessedWord: false,
        },
        {
          name: "Test Player 2",
          socketId: "test-socket-id-2",
          owner: false,
          score: 0,
          guessedWord: false,
        },
        {
          name: playerName,
          socketId,
          owner: false,
          score: 0,
          guessedWord: false,
        },
      ],
    });

    expect(result).toEqual(expected);
  });

  it("errors when the name already exists", () => {
    const socketId = "test-socket-id-3";
    const playerName = "Test Player 2";

    const s: Session = {
      state: "lobby",
      messages: [],
      players: [
        {
          name: "Test Player 1",
          socketId: "test-socket-id-1",
          owner: true,
          score: 0,
          guessedWord: false,
        },
        {
          name: playerName,
          socketId: "test-socket-id-2",
          owner: false,
          score: 0,
          guessedWord: false,
        },
      ],
    };

    const result = performAddPlayer(s)(socketId)(playerName);

    const expected: E.Either<SessionError, never> = E.left(
      sessionError("That name is already in use."),
    );

    expect(result).toEqual(expected);
  });

  it("errors when the socket already exists", () => {
    const socketId = "test-socket-id-2";
    const playerName = "Test Player 3";

    const s: Session = {
      state: "lobby",
      messages: [],
      players: [
        {
          name: "Test Player 1",
          socketId: "test-socket-id-1",
          owner: true,
          score: 0,
          guessedWord: false,
        },
        {
          name: "Test Player 2",
          socketId: socketId,
          owner: false,
          score: 0,
          guessedWord: false,
        },
      ],
    };

    const result = performAddPlayer(s)(socketId)(playerName);

    const expected: E.Either<SessionError, never> = E.left(
      sessionError("That socket is already in the session."),
    );

    expect(result).toEqual(expected);
  });
});
