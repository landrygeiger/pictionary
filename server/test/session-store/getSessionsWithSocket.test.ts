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
          {
            name: "Alice",
            owner: true,
            socketId: "socket1",
            score: 0,
            guessedWord: false,
          },
          {
            name: "Bob",
            owner: false,
            socketId: "socket2",
            score: 0,
            guessedWord: false,
          },
          {
            name: "Charlie",
            owner: false,
            socketId: "socket3",
            score: 0,
            guessedWord: false,
          },
        ],
        messages: [],
        state: "lobby",
      },
      {
        key: "s2",
        players: [
          {
            name: "David",
            owner: true,
            socketId: socketId,
            score: 0,
            guessedWord: false,
          },
          {
            name: "Eva",
            owner: false,
            socketId: "socket5",
            score: 0,
            guessedWord: false,
          },
          {
            name: "Frank",
            owner: false,
            socketId: "socket6",
            score: 0,
            guessedWord: false,
          },
          {
            name: "Grace",
            owner: false,
            socketId: "socket7",
            score: 0,
            guessedWord: false,
          },
        ],
        messages: [],
        state: "lobby",
      },
      {
        key: "s3",
        players: [
          {
            name: "Harry",
            owner: true,
            socketId: "socket8",
            score: 0,
            guessedWord: false,
          },
          {
            name: "Isabel",
            owner: false,
            socketId: "socket9",
            score: 0,
            guessedWord: false,
          },
          {
            name: "Jack",
            owner: false,
            socketId: socketId,
            score: 0,
            guessedWord: false,
          },
        ],
        messages: [],
        state: "lobby",
      },
      {
        key: "s4",
        players: [
          {
            name: "Katherine",
            owner: true,
            socketId: "socket10",
            score: 0,
            guessedWord: false,
          },
          {
            name: "Liam",
            owner: false,
            socketId: "socket11",
            score: 0,
            guessedWord: false,
          },
          {
            name: "Mia",
            owner: false,
            socketId: "socket12",
            score: 0,
            guessedWord: false,
          },
          {
            name: "Noah",
            owner: false,
            socketId: "socket14",
            score: 0,
            guessedWord: false,
          },
        ],
        messages: [],
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
          {
            name: "Alice",
            owner: true,
            socketId: "socket1",
            score: 0,
            guessedWord: false,
          },
          {
            name: "Bob",
            owner: false,
            socketId: "socket2",
            score: 0,
            guessedWord: false,
          },
          {
            name: "Charlie",
            owner: false,
            socketId: "socket3",
            score: 0,
            guessedWord: false,
          },
        ],
        messages: [],
        state: "lobby",
      },
      {
        key: "s2",
        players: [
          {
            name: "David",
            owner: true,
            socketId: "socket17",
            score: 0,
            guessedWord: false,
          },
          {
            name: "Eva",
            owner: false,
            socketId: "socket5",
            score: 0,
            guessedWord: false,
          },
          {
            name: "Frank",
            owner: false,
            socketId: "socket6",
            score: 0,
            guessedWord: false,
          },
          {
            name: "Grace",
            owner: false,
            socketId: "socket7",
            score: 0,
            guessedWord: false,
          },
        ],
        messages: [],
        state: "lobby",
      },
      {
        key: "s3",
        players: [
          {
            name: "Harry",
            owner: true,
            socketId: "socket8",
            score: 0,
            guessedWord: false,
          },
          {
            name: "Isabel",
            owner: false,
            socketId: "socket9",
            score: 0,
            guessedWord: false,
          },
          {
            name: "Jack",
            owner: false,
            socketId: "socket17",
            score: 0,
            guessedWord: false,
          },
        ],
        state: "lobby",
        messages: [],
      },
      {
        key: "s4",
        players: [
          {
            name: "Katherine",
            owner: true,
            socketId: "socket10",
            score: 0,
            guessedWord: false,
          },
          {
            name: "Liam",
            owner: false,
            socketId: "socket11",
            score: 0,
            guessedWord: false,
          },
          {
            name: "Mia",
            owner: false,
            socketId: "socket12",
            score: 0,
            guessedWord: false,
          },
          {
            name: "Noah",
            owner: false,
            socketId: "socket14",
            score: 0,
            guessedWord: false,
          },
        ],
        messages: [],
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
