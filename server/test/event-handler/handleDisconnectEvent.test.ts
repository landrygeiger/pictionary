import { Session } from "@pictionary/shared";
import { WithKey, store, storeAPI } from "../../src/store";
import { Socket } from "socket.io";
import { handleDisconnectEvent } from "../../src/event-handler";
import { DisconnectEventParams } from "@pictionary/shared/src";

describe("handleDisconnectEvent", () => {
  it("deletes sessions that were left and are now empty", async () => {
    const params: DisconnectEventParams = {};

    const socketId = "test-socket-id";
    const sessions: [string, Session][] = [
      [
        "s1",
        {
          players: [
            {
              name: "Alice",
              owner: true,
              socketId: socketId,
              score: 0,
              guessedWord: false,
            },
          ],
          state: "lobby",
          messages: [],
        },
      ],
      [
        "s2",
        {
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
          state: "lobby",
          messages: [],
        },
      ],
      [
        "s3",
        {
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
      ],
      [
        "s4",
        {
          players: [
            {
              name: "Katherine",
              owner: true,
              socketId: socketId,
              score: 0,
              guessedWord: false,
            },
          ],
          state: "lobby",
          messages: [],
        },
      ],
    ];

    const socketMock: Partial<Socket> = {
      join: jest.fn(),
      id: socketId,
      broadcast: {
        to: jest.fn().mockReturnValue({ emit: jest.fn() }),
      } as any,
    };

    const sessionStore = store<Session>();
    const sessionsAPI = storeAPI(sessionStore);

    sessions.forEach(s => sessionStore.data.set(s[0], s[1]));

    await handleDisconnectEvent(socketMock as Socket)(sessionsAPI)(params);

    const expectedSessions: [string, Session][] = [
      [
        "s2",
        {
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
          state: "lobby",
          messages: [],
        },
      ],
      [
        "s3",
        {
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
      ],
    ];

    const resultSessions = [...sessionStore.data.entries()];

    expect(resultSessions).toEqual(expectedSessions);
  });

  it("makes player leave sessions they're in", async () => {
    const params: DisconnectEventParams = {};

    const socketId = "test-socket-id";
    const sessions: [string, Session][] = [
      [
        "s1",
        {
          players: [
            {
              name: "Alice",
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
              name: "Grace",
              owner: false,
              socketId: "socket7",
              score: 0,
              guessedWord: false,
            },
          ],
          state: "lobby",
          messages: [],
        },
      ],
      [
        "s2",
        {
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
          state: "lobby",
          messages: [],
        },
      ],
      [
        "s3",
        {
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
      ],
      [
        "s4",
        {
          players: [
            {
              name: "Katherine",
              owner: true,
              socketId: socketId,
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
          ],
          state: "lobby",
          messages: [],
        },
      ],
    ];

    const socketMock: Partial<Socket> = {
      join: jest.fn(),
      id: socketId,
      broadcast: {
        to: jest.fn().mockReturnValue({ emit: jest.fn() }),
      } as any,
    };

    const sessionStore = store<Session>();
    const sessionsAPI = storeAPI(sessionStore);

    sessions.forEach(s => sessionStore.data.set(s[0], s[1]));

    await handleDisconnectEvent(socketMock as Socket)(sessionsAPI)(params);

    const expectedSessions: [string, Session][] = [
      [
        "s1",
        {
          players: [
            {
              name: "Eva",
              owner: true,
              socketId: "socket5",
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
          state: "lobby",
          messages: [],
        },
      ],
      [
        "s2",
        {
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
          state: "lobby",
          messages: [],
        },
      ],
      [
        "s3",
        {
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
      ],
      [
        "s4",
        {
          players: [
            {
              name: "Isabel",
              owner: true,
              socketId: "socket9",
              score: 0,
              guessedWord: false,
            },
          ],
          state: "lobby",
          messages: [],
        },
      ],
    ];

    const resultSessions = [...sessionStore.data.entries()];

    expect(resultSessions).toEqual(expectedSessions);
  });
});
