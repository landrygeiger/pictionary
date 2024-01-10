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
  (sessionsAPI: StoreAPI<Session>) =>
  async (params: CreateEventParams): Promise<CreateEventResponse> =>
    pipe(
      TE.Do,
      TE.bind("ownerName", () => TE.fromEither(validateName(params.ownerName))),
      TE.let("sessionId", () => newSessionId()),
      TE.let("session", ({ ownerName }) => newSession(ownerName)),
      TE.tap(({ sessionId, session }) =>
        sessionsAPI.create(sessionId)(session)
      ),
      TE.let(
        "payload",
        ({ ownerName, sessionId }): Payload => ({ name: ownerName, sessionId })
      ),
      TE.map(({ payload }) => ({ token: createJWT(payload) }))
    )();
