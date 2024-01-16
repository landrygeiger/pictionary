import { pipe } from "fp-ts/lib/function";
import { StoreAPI } from "./store";
import { Session } from "@pictionary/shared";
import { reduceSession } from "./session-state";
import * as TE from "fp-ts/TaskEither";
import { broadcastSessionUpdateToAll } from "./event-handler";
import { Socket } from "socket.io";

export const startSessionTimer =
  (socket: Socket) =>
  (sessionsAPI: StoreAPI<Session>) =>
  (sessionId: string) =>
  (timerToken: string) =>
    setTimeout(() => tick(socket)(sessionsAPI)(sessionId)(timerToken), 1000);

const tick =
  (socket: Socket) =>
  (sessionsAPI: StoreAPI<Session>) =>
  (sessionId: string) =>
  (timerToken: string): any =>
    pipe(
      sessionsAPI.updateEither(sessionId)(
        // TODO: words
        reduceSession({ kind: "tick", timerToken, newWord: "beans" }),
      ),
      TE.map(session =>
        broadcastSessionUpdateToAll(socket)(sessionId)({
          id: sessionId,
          ...session,
        }),
      ),
      TE.map(() =>
        setTimeout(
          () => tick(socket)(sessionsAPI)(sessionId)(timerToken),
          1000,
        ),
      ),
    )();
