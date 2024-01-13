import {
  Player,
  Session,
  SessionError,
  sessionError,
} from "@pictionary/shared";
import * as E from "fp-ts/Either";
import { performRemovePlayer } from "../../src/session-state";

describe("performRemovePlayer", () => {
  it("removes the player", () => {
    const p: Player = {
      name: "Test Player 3",
      socketId: "test-socket-id-3",
      owner: false,
    };

    const s: Session = {
      state: "lobby",
      players: [
        { name: "Test Player 1", socketId: "test-socket-id-1", owner: false },
        { name: "Test Player 2", socketId: "test-socket-id-2", owner: true },
        p,
        { name: "Test Player 4", socketId: "test-socket-id-4", owner: false },
      ],
    };

    const result = performRemovePlayer(s)(p.socketId);

    const expected: E.Either<never, Session> = E.right({
      state: "lobby",
      players: [
        { name: "Test Player 1", socketId: "test-socket-id-1", owner: false },
        { name: "Test Player 2", socketId: "test-socket-id-2", owner: true },
        { name: "Test Player 4", socketId: "test-socket-id-4", owner: false },
      ],
    });

    expect(result).toEqual(expected);
  });

  it("removes owner and promotes first player in list", () => {
    const p: Player = {
      name: "Test Player 3",
      socketId: "test-socket-id-3",
      owner: true,
    };

    const s: Session = {
      state: "lobby",
      players: [
        { name: "Test Player 1", socketId: "test-socket-id-1", owner: false },
        { name: "Test Player 2", socketId: "test-socket-id-2", owner: false },
        p,
        { name: "Test Player 4", socketId: "test-socket-id-4", owner: false },
      ],
    };

    const result = performRemovePlayer(s)(p.socketId);

    const expected: E.Either<never, Session> = E.right({
      state: "lobby",
      players: [
        { name: "Test Player 1", socketId: "test-socket-id-1", owner: true },
        { name: "Test Player 2", socketId: "test-socket-id-2", owner: false },
        { name: "Test Player 4", socketId: "test-socket-id-4", owner: false },
      ],
    });

    expect(result).toEqual(expected);
  });

  it("returns an ending session when last player is removed", () => {
    const p: Player = {
      name: "Test Player 3",
      socketId: "test-socket-id-3",
      owner: false,
    };

    const s: Session = {
      state: "lobby",
      players: [p],
    };

    const result = performRemovePlayer(s)(p.socketId);

    const expected: E.Either<never, Session> = E.right({
      state: "ending",
      players: [],
    });

    expect(result).toEqual(expected);
  });

  it("errors when the socket id is not in the session", () => {
    const socketId = "test-socket-id-5";

    const s: Session = {
      state: "lobby",
      players: [
        { name: "Test Player 1", socketId: "test-socket-id-1", owner: false },
        { name: "Test Player 2", socketId: "test-socket-id-2", owner: true },
        { name: "Test player 3", socketId: "test-socket-id-3", owner: false },
        { name: "Test Player 4", socketId: "test-socket-id-4", owner: false },
      ],
    };

    const result = performRemovePlayer(s)(socketId);

    const expected: E.Either<SessionError, never> = E.left(
      sessionError("A player with that socket id could not be found.")
    );

    expect(result).toEqual(expected);
  });
});
