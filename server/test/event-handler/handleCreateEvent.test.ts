import { describe, it, expect } from "@jest/globals";
import * as E from "fp-ts/Either";
import {
  CreateEventParams,
  Session,
  ValidationError,
  config,
  validationError,
} from "@pictionary/shared";
import { handleCreateEvent } from "../../src/event-handler";
import { Socket } from "socket.io";
import { StoreAPI, store, storeAPI } from "../../src/store";

describe("handleCreateEvent", () => {
  it("validates owner name", async () => {
    const params: CreateEventParams = {
      ownerName: "this-owner-name-is-too-long",
    };

    const socketMock: Partial<Socket> = {};

    const sessionsAPIMock: Partial<StoreAPI<Session>> = {};

    const result = await handleCreateEvent(socketMock as Socket)(
      sessionsAPIMock as StoreAPI<Session>,
    )(params);

    const expected: E.Either<ValidationError, never> = E.left(
      validationError(
        `Names must be less than ${config.maxNameLength} characters long.`,
      ),
    );

    expect(result).toEqual(expected);
  });

  it("creates a session", async () => {
    const params: CreateEventParams = {
      ownerName: "test-owner",
    };

    const socketMock: Partial<Socket> = {
      join: jest.fn(),
      id: "socket-id",
    };

    const sessionStore = store<Session>();

    await handleCreateEvent(socketMock as Socket)(storeAPI(sessionStore))(
      params,
    );

    const sessions = [...sessionStore.data.entries()];

    const expectedSession: Session = {
      state: "lobby",
      messages: [],
      players: [
        {
          name: params.ownerName,
          owner: true,
          socketId: socketMock.id as string,
          score: 0,
          guessedWord: false,
        },
      ],
    };

    const expectedSessions: [string, Session][] = [
      [expect.any(String) as any, expectedSession],
    ];

    expect(sessions).toEqual(expectedSessions);
  });

  it("makes socket join the session room", async () => {
    const params: CreateEventParams = {
      ownerName: "test-owner",
    };

    const socketMock: Partial<Socket> = {
      join: jest.fn(),
      id: "socket-id",
    };

    const sessionStore = store<Session>();

    await handleCreateEvent(socketMock as Socket)(storeAPI(sessionStore))(
      params,
    );

    expect(socketMock.join).toBeCalledWith(expect.any(String));
  });
});
