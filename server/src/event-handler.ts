import {
  CreateEventParams,
  CreateEventResponse,
  DRAW_EVENT,
  DrawEventParams,
  Payload,
  Session,
  createJWT,
  validateName,
} from "@pictionary/shared";
import { Socket } from "socket.io";
import { StoreAPI } from "./store";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import { newSession, newSessionId } from "./session";

const broadcastToAllExceptSender =
  <Params>(event: string) =>
  (socket: Socket) =>
  (params: Params) => {
    socket.broadcast.emit(event, params);
  };

export const handleDrawEvent =
  broadcastToAllExceptSender<DrawEventParams>(DRAW_EVENT);

export const handleCreateEvent =
  (socket: Socket) =>
  (sessionsAPI: StoreAPI<Session>) =>
  async (params: CreateEventParams, cb: (res: CreateEventResponse) => void) => {
    const res = await pipe(
      TE.Do,
      TE.bind("ownerName", () => TE.fromEither(validateName(params.ownerName))),
      TE.let("sessionId", () => newSessionId()),
      TE.let("session", ({ ownerName }) => newSession(ownerName)),
      TE.tap(({ sessionId, session }) =>
        sessionsAPI.create(sessionId)(session)
      ),
      TE.tap(({ sessionId }) => TE.right(socket.join(sessionId))),
      TE.let(
        "payload",
        ({ ownerName, sessionId }): Payload => ({ name: ownerName, sessionId })
      ),
      TE.tap(({ sessionId, ownerName }) =>
        TE.right(
          console.log(
            `[Server]: Created session with id ${sessionId} and owner ${ownerName}.`
          )
        )
      ),
      TE.map(({ payload }) => ({ token: createJWT(payload) }))
    )();
    cb(res);
  };
