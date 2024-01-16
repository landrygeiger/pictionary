import { expect } from "@jest/globals";
import * as E from "fp-ts/Either";
import {
  JoinEventParams,
  Session,
  ValidationError,
  WithId,
  config,
  validationError,
} from "@pictionary/shared";
import { Socket } from "socket.io";
import { StoreAPI, store, storeAPI } from "../../src/store";
import { handleJoinEvent } from "../../src/event-handler";

describe("handleJoinEvent", () => {
  it("validates the player name", async () => {
    const params: JoinEventParams = {
      playerName: "this-player-name-is-too-long",
      sessionId: "test-session-id",
    };

    const socketMock: Partial<Socket> = {};

    const sessionsAPIMock: Partial<StoreAPI<Session>> = {};

    const result = await handleJoinEvent(socketMock as Socket)(
      sessionsAPIMock as StoreAPI<Session>,
    )(params);

    const expected: E.Either<ValidationError, never> = E.left(
      validationError(
        `Names must be less than ${config.maxNameLength} characters long.`,
      ),
    );

    expect(result).toEqual(expected);
  });

  it("validates the session id", async () => {
    const params: JoinEventParams = {
      playerName: "test-name",
      sessionId: "",
    };

    const socketMock: Partial<Socket> = {};

    const sessionsAPIMock: Partial<StoreAPI<Session>> = {};

    const result = await handleJoinEvent(socketMock as Socket)(
      sessionsAPIMock as StoreAPI<Session>,
    )(params);

    const expected: E.Either<ValidationError, never> = E.left(
      validationError("Session ids must not be empty."),
    );

    expect(result).toEqual(expected);
  });

  it("puts the player in the session", async () => {
    const params: JoinEventParams = {
      playerName: "test-name",
      sessionId: "test-session",
    };

    const socketMock: Partial<Socket> = {
      join: jest.fn(),
      id: "test-socket-id",
      broadcast: {
        to: jest.fn().mockReturnValue({ emit: jest.fn() }),
      } as any,
    };

    const sessions = store<Session>();
    const sessionsAPI = storeAPI(sessions);

    sessions.data.set(params.sessionId, {
      state: "lobby",
      messages: [],
      players: [
        {
          name: "test-player-2",
          owner: true,
          socketId: "test-socket-id-2",
          score: 0,
          guessedWord: false,
        },
      ],
    });

    const result = await handleJoinEvent(socketMock as Socket)(sessionsAPI)(
      params,
    );

    const expected: E.Either<never, WithId<Session>> = E.right({
      id: expect.any(String) as any,
      state: "lobby",
      messages: [],
      players: [
        {
          name: "test-player-2",
          owner: true,
          socketId: "test-socket-id-2",
          score: 0,
          guessedWord: false,
        },
        {
          name: params.playerName,
          owner: false,
          socketId: socketMock.id as string,
          score: 0,
          guessedWord: false,
        },
      ],
    });

    expect(result).toEqual(expected);
  });

  it("puts socket in the session room", async () => {
    const params: JoinEventParams = {
      playerName: "test-name",
      sessionId: "test-session",
    };

    const socketMock: Partial<Socket> = {
      join: jest.fn(),
      id: "test-socket-id",
      broadcast: {
        to: jest.fn().mockReturnValue({ emit: jest.fn() }),
      } as any,
    };

    const sessions = store<Session>();
    const sessionsAPI = storeAPI(sessions);

    sessions.data.set(params.sessionId, {
      state: "lobby",
      messages: [],
      players: [
        {
          name: "test-player-2",
          owner: true,
          socketId: "test-socket-id-2",
          score: 0,
          guessedWord: false,
        },
      ],
    });

    await handleJoinEvent(socketMock as Socket)(sessionsAPI)(params);

    expect(socketMock.join).toHaveBeenCalledWith(expect.any(String));
  });
});
