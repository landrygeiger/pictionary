import {
  CreateEventParams,
  CreateEventResponse,
  DRAW_EVENT,
  DisconnectEventParams,
  DisconnectEventResponse,
  DrawEventParams,
  JoinEventParams,
  JoinEventResponse,
  MessageEventParams,
  MessageEventResponse,
  Session,
  StartEventParams,
  StartEventResponse,
  UPDATE_EVENT,
  UpdateEventParams,
  filterSessionsInState,
  newSession,
  validateName,
  validateSessionId,
} from "@pictionary/shared";
import { Socket } from "socket.io";
import { StoreAPI } from "./store";
import { constVoid, pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import * as A from "fp-ts/Array";
import {
  getPlayerBySocketId,
  newSessionId,
  newTimerToken,
  reduceSession,
} from "./session-state";
import { getSessionsWithSocket, leaveSessions } from "./session-store";
import { startSessionTimer } from "./timer";

export const broadcastToRestOfRoom =
  <Params>(event: string) =>
  (socket: Socket) =>
  (room: string) =>
  (params: Params) =>
    socket.broadcast.to(room).emit(event, params);

export const broadcastToRoomAndClient =
  <Params>(event: string) =>
  (socket: Socket) =>
  (room: string) =>
  (params: Params) => {
    socket.to(room).emit(event, params);
    socket.emit(event, params);
  };

export const broadcastSessionUpdate =
  broadcastToRestOfRoom<UpdateEventParams>(UPDATE_EVENT);

export const broadcastSessionUpdateToAll =
  broadcastToRoomAndClient<UpdateEventParams>(UPDATE_EVENT);

export const broadcastDrawEvent =
  broadcastToRestOfRoom<DrawEventParams>(DRAW_EVENT);

export const handleDrawEvent = (socket: Socket) => (params: DrawEventParams) =>
  broadcastDrawEvent(socket)(params.sessionId)(params);

type EventHandler<Params, Response> = (
  socket: Socket,
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
> = socket => sessionsAPI => params =>
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
          `[Server]: Created session with id ${sessionId} and owner ${ownerName}.`,
        ),
      ),
    ),
    TE.map(({ session, sessionId }) => ({ id: sessionId, ...session })),
  )();

export const handleJoinEvent: EventHandler<
  JoinEventParams,
  JoinEventResponse
> = socket => sessionsAPI => params =>
  pipe(
    TE.Do,
    TE.bind("playerName", () => TE.fromEither(validateName(params.playerName))),
    TE.bind("sessionId", () =>
      TE.fromEither(validateSessionId(params.sessionId)),
    ),
    TE.bindW("session", ({ playerName, sessionId }) =>
      sessionsAPI.updateEither(sessionId)(
        reduceSession({ kind: "join", playerName, socketId: socket.id }),
      ),
    ),
    TE.tap(({ sessionId }) => TE.right(socket.join(sessionId))),
    TE.tap(({ session, sessionId }) =>
      TE.right(
        broadcastSessionUpdate(socket)(sessionId)({
          id: sessionId,
          ...session,
        }),
      ),
    ),
    TE.tap(({ playerName, sessionId }) =>
      TE.right(
        console.log(
          `[Server]: Player ${playerName} joined session with id ${sessionId}.`,
        ),
      ),
    ),
    TE.map(({ session, sessionId }) => ({ id: sessionId, ...session })),
  )();

export const handleDisconnectEvent: EventHandler<
  DisconnectEventParams,
  DisconnectEventResponse
> = socket => sessionsAPI => () =>
  pipe(
    socket.id,
    getSessionsWithSocket(sessionsAPI),
    TE.flatMap(leaveSessions(sessionsAPI)(socket)),
    TE.tap(sessions =>
      TE.right(
        sessions.map(session =>
          broadcastSessionUpdate(socket)(session.key)({
            id: session.key,
            ...session,
          }),
        ),
      ),
    ),
    TE.map(filterSessionsInState("ending")),
    TE.map(A.map(session => session.key)),
    TE.flatMap(sessionsAPI.deleteMany),
    TE.tap(() =>
      TE.right(
        console.log(`[Server]: Player with id ${socket.id} has disconnected.`),
      ),
    ),
    TE.map(constVoid),
  )();

export const handleMessageEvent: EventHandler<
  MessageEventParams,
  MessageEventResponse
> = socket => sessionsAPI => params =>
  pipe(
    TE.Do,
    TE.bind("sessionId", () =>
      TE.fromEither(validateSessionId(params.sessionId)),
    ),
    TE.bindW("session", () => sessionsAPI.read(params.sessionId)),
    TE.bindW("player", ({ session }) =>
      TE.fromEither(getPlayerBySocketId(session)(socket.id)),
    ),
    TE.let("newTimerToken", () => newTimerToken()),
    TE.bindW("updatedSession", ({ newTimerToken }) =>
      sessionsAPI.updateEither(params.sessionId)(
        reduceSession({
          kind: "guess",
          guess: params.message,
          newTimerToken,
          socketId: socket.id,
        }),
      ),
    ),
    TE.tap(({ updatedSession, sessionId, newTimerToken }) =>
      TE.right(
        updatedSession.state === "between" &&
          startSessionTimer(socket)(sessionsAPI)(sessionId)(newTimerToken),
      ),
    ),
    TE.tap(({ updatedSession, sessionId }) =>
      TE.right(
        broadcastSessionUpdateToAll(socket)(sessionId)({
          id: sessionId,
          ...updatedSession,
        }),
      ),
    ),
    TE.map(constVoid),
  )();

export const handleStartEvent: EventHandler<
  StartEventParams,
  StartEventResponse
> = socket => sessionsAPI => params =>
  pipe(
    TE.Do,
    TE.bind("sessionId", () =>
      TE.fromEither(validateSessionId(params.sessionId)),
    ),
    TE.let("timerToken", () => newTimerToken()),
    TE.bindW("startedSession", ({ sessionId, timerToken }) =>
      sessionsAPI.updateEither(sessionId)(
        reduceSession({ kind: "start-between", timerToken }),
      ),
    ),
    TE.tap(({ startedSession, sessionId }) =>
      TE.right(
        broadcastSessionUpdateToAll(socket)(sessionId)({
          id: sessionId,
          ...startedSession,
        }),
      ),
    ),
    TE.tap(({ sessionId, timerToken }) =>
      TE.right(startSessionTimer(socket)(sessionsAPI)(sessionId)(timerToken)),
    ),
    TE.map(constVoid),
  )();
