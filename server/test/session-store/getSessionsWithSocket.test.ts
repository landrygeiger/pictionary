import { Session } from "@pictionary/shared";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { StoreAPI, WithKey } from "../../src/store";
import {
  getSessionsWithSocket,
  sessionWithKeyToEntry,
} from "../../src/session-store";

describe("getSessionsWithSocket", () => {
  it("returns the sessions with the socket id", async () => {
    const socketId = "test-socket-id-to-be-found";
    const sessions: WithKey<Session>[] = [
      {
        key: "s1",
        players: [
          { name: "Alice", owner: true, socketId: "socket1" },
          { name: "Bob", owner: false, socketId: "socket2" },
          { name: "Charlie", owner: false, socketId: "socket3" },
        ],
        state: "lobby",
      },
      {
        key: "s2",
        players: [
          { name: "David", owner: true, socketId: socketId },
          { name: "Eva", owner: false, socketId: "socket5" },
          { name: "Frank", owner: false, socketId: "socket6" },
          { name: "Grace", owner: false, socketId: "socket7" },
        ],
        state: "lobby",
      },
      {
        key: "s3",
        players: [
          { name: "Harry", owner: true, socketId: "socket8" },
          { name: "Isabel", owner: false, socketId: "socket9" },
          { name: "Jack", owner: false, socketId: socketId },
        ],
        state: "lobby",
      },
      {
        key: "s4",
        players: [
          { name: "Katherine", owner: true, socketId: "socket10" },
          { name: "Liam", owner: false, socketId: "socket11" },
          { name: "Mia", owner: false, socketId: "socket12" },
          { name: "Noah", owner: false, socketId: "socket14" },
        ],
        state: "lobby",
      },
    ];

    const sessionsAPIMock: Partial<StoreAPI<Session>> = {
      list: jest
        .fn()
        .mockReturnValueOnce(TE.right(sessions.map(sessionWithKeyToEntry))),
    };

    const result = await getSessionsWithSocket(
      sessionsAPIMock as StoreAPI<Session>,
    )(socketId)();

    const expected: E.Either<never, WithKey<Session>[]> = E.right([
      sessions[1],
      sessions[2],
    ]);

    expect(result).toEqual(expected);
  });

  it("returns empty list when no sessions have the socket", async () => {
    const socketId = "test-socket-id-to-be-found";
    const sessions: WithKey<Session>[] = [
      {
        key: "s1",
        players: [
          { name: "Alice", owner: true, socketId: "socket1" },
          { name: "Bob", owner: false, socketId: "socket2" },
          { name: "Charlie", owner: false, socketId: "socket3" },
        ],
        state: "lobby",
      },
      {
        key: "s2",
        players: [
          { name: "David", owner: true, socketId: "socket17" },
          { name: "Eva", owner: false, socketId: "socket5" },
          { name: "Frank", owner: false, socketId: "socket6" },
          { name: "Grace", owner: false, socketId: "socket7" },
        ],
        state: "lobby",
      },
      {
        key: "s3",
        players: [
          { name: "Harry", owner: true, socketId: "socket8" },
          { name: "Isabel", owner: false, socketId: "socket9" },
          { name: "Jack", owner: false, socketId: "socket17" },
        ],
        state: "lobby",
      },
      {
        key: "s4",
        players: [
          { name: "Katherine", owner: true, socketId: "socket10" },
          { name: "Liam", owner: false, socketId: "socket11" },
          { name: "Mia", owner: false, socketId: "socket12" },
          { name: "Noah", owner: false, socketId: "socket14" },
        ],
        state: "lobby",
      },
    ];

    const sessionsAPIMock: Partial<StoreAPI<Session>> = {
      list: jest
        .fn()
        .mockReturnValueOnce(TE.right(sessions.map(sessionWithKeyToEntry))),
    };

    const result = await getSessionsWithSocket(
      sessionsAPIMock as StoreAPI<Session>,
    )(socketId)();

    const expected: E.Either<never, WithKey<Session>[]> = E.right([]);

    expect(result).toEqual(expected);
  });
});
