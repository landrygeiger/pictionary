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
          players: [{ name: "Alice", owner: true, socketId: socketId }],
          state: "lobby",
        },
      ],
      [
        "s2",
        {
          players: [
            { name: "David", owner: true, socketId: "socket17" },
            { name: "Eva", owner: false, socketId: "socket5" },
            { name: "Frank", owner: false, socketId: "socket6" },
            { name: "Grace", owner: false, socketId: "socket7" },
          ],
          state: "lobby",
        },
      ],
      [
        "s3",
        {
          players: [
            { name: "Harry", owner: true, socketId: "socket8" },
            { name: "Isabel", owner: false, socketId: "socket9" },
            { name: "Jack", owner: false, socketId: "socket17" },
          ],
          state: "lobby",
        },
      ],
      [
        "s4",
        {
          players: [{ name: "Katherine", owner: true, socketId: socketId }],
          state: "lobby",
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
            { name: "David", owner: true, socketId: "socket17" },
            { name: "Eva", owner: false, socketId: "socket5" },
            { name: "Frank", owner: false, socketId: "socket6" },
            { name: "Grace", owner: false, socketId: "socket7" },
          ],
          state: "lobby",
        },
      ],
      [
        "s3",
        {
          players: [
            { name: "Harry", owner: true, socketId: "socket8" },
            { name: "Isabel", owner: false, socketId: "socket9" },
            { name: "Jack", owner: false, socketId: "socket17" },
          ],
          state: "lobby",
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
            { name: "Alice", owner: true, socketId: socketId },
            { name: "Eva", owner: false, socketId: "socket5" },
            { name: "Grace", owner: false, socketId: "socket7" },
          ],
          state: "lobby",
        },
      ],
      [
        "s2",
        {
          players: [
            { name: "David", owner: true, socketId: "socket17" },
            { name: "Eva", owner: false, socketId: "socket5" },
            { name: "Frank", owner: false, socketId: "socket6" },
            { name: "Grace", owner: false, socketId: "socket7" },
          ],
          state: "lobby",
        },
      ],
      [
        "s3",
        {
          players: [
            { name: "Harry", owner: true, socketId: "socket8" },
            { name: "Isabel", owner: false, socketId: "socket9" },
            { name: "Jack", owner: false, socketId: "socket17" },
          ],
          state: "lobby",
        },
      ],
      [
        "s4",
        {
          players: [
            { name: "Katherine", owner: true, socketId: socketId },
            { name: "Isabel", owner: false, socketId: "socket9" },
          ],
          state: "lobby",
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
            { name: "Eva", owner: true, socketId: "socket5" },
            { name: "Grace", owner: false, socketId: "socket7" },
          ],
          state: "lobby",
        },
      ],
      [
        "s2",
        {
          players: [
            { name: "David", owner: true, socketId: "socket17" },
            { name: "Eva", owner: false, socketId: "socket5" },
            { name: "Frank", owner: false, socketId: "socket6" },
            { name: "Grace", owner: false, socketId: "socket7" },
          ],
          state: "lobby",
        },
      ],
      [
        "s3",
        {
          players: [
            { name: "Harry", owner: true, socketId: "socket8" },
            { name: "Isabel", owner: false, socketId: "socket9" },
            { name: "Jack", owner: false, socketId: "socket17" },
          ],
          state: "lobby",
        },
      ],
      [
        "s4",
        {
          players: [{ name: "Isabel", owner: true, socketId: "socket9" }],
          state: "lobby",
        },
      ],
    ];

    const resultSessions = [...sessionStore.data.entries()];

    expect(resultSessions).toEqual(expectedSessions);
  });
});
