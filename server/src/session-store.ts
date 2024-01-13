import { Session } from "@pictionary/shared";
import { StoreAPI, WithKey, store, storeAPI } from "./store";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import * as A from "fp-ts/Array";
import { reduceSession } from "./session-state";
import { Socket } from "socket.io";

const sessions = store<Session>();
export const sessionsAPI = storeAPI(sessions);

const isSocketIdInSession = (socketId: string) => (session: Session) =>
  pipe(
    session.players,
    A.exists((p) => p.socketId === socketId)
  );

const sessionEntryToWithKey = (entry: [string, Session]): WithKey<Session> => ({
  ...entry[1],
  key: entry[0],
});

export const sessionWithKeyToEntry = (
  session: WithKey<Session>
): [string, Session] => [session.key, session];

export const getSessionsWithSocket =
  (sessionsAPI: StoreAPI<Session>) => (socketId: string) =>
    pipe(
      sessionsAPI.list(),
      TE.map(A.map(sessionEntryToWithKey)),
      TE.map(A.filter(isSocketIdInSession(socketId)))
    );

const leaveSession =
  (sessionsAPI: StoreAPI<Session>) =>
  (socket: Socket) =>
  (session: WithKey<Session>) =>
    pipe(
      sessionsAPI.updateEither(session.key)(
        reduceSession({ kind: "leave", socketId: socket.id })
      ),
      TE.map(
        (updatedSession): WithKey<Session> => ({
          ...updatedSession,
          key: session.key,
        })
      )
    );

export const leaveSessions =
  (sessionsAPI: StoreAPI<Session>) => (socket: Socket) =>
    A.traverse(TE.ApplicativeSeq)(leaveSession(sessionsAPI)(socket));
