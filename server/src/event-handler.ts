import * as E from "fp-ts/Either";
import {
  CreateEventParams,
  CreateEventResponse,
  DRAW_EVENT,
  DisconnectEventParams,
  DisconnectEventResponse,
  DrawEventParams,
  JoinEventParams,
  JoinEventResponse,
  Session,
  filterSessionsInState,
  validateName,
} from "@pictionary/shared";
import { Socket } from "socket.io";
import { StoreAPI } from "./store";
import { constVoid, pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import * as A from "fp-ts/Array";
import { newSession, newSessionId, reduceSession } from "./session-state";
import { getSessionsWithSocket, leaveSessions } from "./session-store";

const broadcastToAllExceptSender =
  <Params>(event: string) =>
  (socket: Socket) =>
  (params: Params) => {
    socket.broadcast.emit(event, params);
  };

export const handleDrawEvent =
  broadcastToAllExceptSender<DrawEventParams>(DRAW_EVENT);

type EventHandler<Params, Response> = (
  socket: Socket
) => (sessionsAPI: StoreAPI<Session>) => (params: Params) => Promise<Response>;

export const socketEventHandler =
  (socket: Socket) =>
  (sessionsAPI: StoreAPI<Session>) =>
  <Params, Response>(handler: EventHandler<Params, Response>) =>
  async (params: Params, callback: (res: Response) => void) => {
    const result = await handler(socket)(sessionsAPI)(params);
    callback && callback(result);
  };

export const handleCreateEvent: EventHandler<
  CreateEventParams,
  CreateEventResponse
> = (socket) => (sessionsAPI) => (params) =>
  pipe(
    TE.Do,
    TE.bind("ownerName", () => TE.fromEither(validateName(params.ownerName))),
    TE.let("sessionId", () => newSessionId()),
    TE.let("session", ({ ownerName }) => newSession(socket.id, ownerName)),
    TE.tap(({ sessionId, session }) => sessionsAPI.create(sessionId)(session)),
    TE.tap(({ sessionId }) => TE.right(socket.join(sessionId))),
    TE.tap(({ sessionId, ownerName }) =>
      TE.right(
        console.log(
          `[Server]: Created session with id ${sessionId} and owner ${ownerName}.`
        )
      )
    ),
    TE.map(({ sessionId }) => ({ sessionId }))
  )();

export const handleJoinEvent: EventHandler<
  JoinEventParams,
  JoinEventResponse
> = (socket) => (sessionsAPI) => (params) =>
  pipe(
    TE.Do,
    TE.bind("playerName", () => TE.fromEither(validateName(params.playerName))),
    TE.tap(({ playerName }) =>
      sessionsAPI.updateEither(params.sessionId)(
        reduceSession({ kind: "join", playerName, socketId: socket.id })
      )
    ),
    TE.tap(() => TE.right(socket.join(params.sessionId))),
    TE.tap(({ playerName }) =>
      TE.right(
        console.log(
          `[Server]: Player ${playerName} joined session with id ${params.sessionId}.`
        )
      )
    ),
    TE.map(constVoid)
  )();

export const handleDisconnectEvent: EventHandler<
  DisconnectEventParams,
  DisconnectEventResponse
> = (socket) => (sessionsAPI) => (_) =>
  pipe(
    socket.id,
    getSessionsWithSocket(sessionsAPI),
    TE.flatMap(leaveSessions(sessionsAPI)(socket)),
    TE.map(filterSessionsInState("ending")),
    TE.map(A.map((session) => session.key)),
    TE.flatMap(sessionsAPI.deleteMany),
    TE.tap(() =>
      TE.right(
        console.log(`[Server]: Player with id ${socket.id} has disconnected.`)
      )
    ),
    TE.map(constVoid)
  )();
