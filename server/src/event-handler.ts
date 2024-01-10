import {
  CreateEventParams,
  CreateEventResponse,
  DRAW_EVENT,
  DrawEventParams,
  JoinEventParams,
  JoinEventResponse,
  Payload,
  Session,
  createJWT,
  validateName,
} from "@pictionary/shared";
import { Socket } from "socket.io";
import { StoreAPI } from "./store";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import { newSession, newSessionId, reduceSession } from "./session";

const broadcastToAllExceptSender =
  <Params>(event: string) =>
  (socket: Socket) =>
  (params: Params) => {
    socket.broadcast.emit(event, params);
  };

export const handleDrawEvent =
  broadcastToAllExceptSender<DrawEventParams>(DRAW_EVENT);

type EventHandler<Params, Response> = (
  socket: Socket,
  sessionsAPI: StoreAPI<Session>
) => (params: Params) => Promise<Response>;

export const socketEventHandler =
  <Params, Response>(
    socket: Socket,
    sessionsAPI: StoreAPI<Session>,
    handler: EventHandler<Params, Response>
  ) =>
  async (params: Params, callback: (res: Response) => void) =>
    callback(await handler(socket, sessionsAPI)(params));

export const handleCreateEvent: EventHandler<
  CreateEventParams,
  CreateEventResponse
> = (socket, sessionsAPI) => (params) =>
  pipe(
    TE.Do,
    TE.bind("ownerName", () => TE.fromEither(validateName(params.ownerName))),
    TE.let("sessionId", () => newSessionId()),
    TE.let("session", ({ ownerName }) => newSession(ownerName)),
    TE.tap(({ sessionId, session }) => sessionsAPI.create(sessionId)(session)),
    TE.tap(({ sessionId }) => TE.right(socket.join(sessionId))),
    TE.tap(({ sessionId, ownerName }) =>
      TE.right(
        console.log(
          `[Server]: Created session with id ${sessionId} and owner ${ownerName}.`
        )
      )
    ),
    TE.let(
      "payload",
      ({ ownerName, sessionId }): Payload => ({ name: ownerName, sessionId })
    ),
    TE.map(({ payload }) => ({ token: createJWT(payload) }))
  )();

export const handleJoinEvent: EventHandler<JoinEventParams, any> =
  (socket, sessionsAPI) => (params) =>
    pipe(
      TE.Do,
      TE.bind("playerName", () =>
        TE.fromEither(validateName(params.playerName))
      ),
      TE.tap(({ playerName }) =>
        sessionsAPI.updateEither(params.sessionId)(
          reduceSession({ kind: "join", playerName })
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
      TE.let(
        "payload",
        ({ playerName }): Payload => ({
          name: playerName,
          sessionId: params.sessionId,
        })
      ),
      TE.map(({ payload }) => ({ token: createJWT(payload) }))
    )();
