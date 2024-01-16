import { pipe } from "fp-ts/lib/function";
import { StoreAPI } from "./store";
import { Session, config, randomElement } from "@pictionary/shared";
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
        reduceSession({
          kind: "tick",
          timerToken,
          newWord: randomElement(config.words),
        }),
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
