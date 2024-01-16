import {
  AlreadyExistsError,
  MutexError,
  NotFoundError,
  SessionError,
  ValidationError,
} from "./error";
import { Point } from "./point";
import * as E from "fp-ts/Either";
import { Session } from "./session";

export type WithId<T> = { id: string } & T;

export const DRAW_EVENT = "draw" as const;

export type DrawEventParams = {
  start: Point;
  end: Point;
  color: string;
  lineWidth: number;
  sessionId: string;
};

export const CREATE_EVENT = "create" as const;

export type CreateEventParams = {
  ownerName: string;
};

export type CreateEventResponse = E.Either<
  MutexError | ValidationError | AlreadyExistsError,
  WithId<Session>
>;

export const JOIN_EVENT = "join" as const;

export type JoinEventParams = {
  sessionId: string;
  playerName: string;
};

export type JoinEventResponse = E.Either<
  MutexError | ValidationError | NotFoundError | SessionError,
  WithId<Session>
>;

export const DISCONNECT_EVENT = "disconnect" as const;

export type DisconnectEventParams = {};

export type DisconnectEventResponse = E.Either<
  MutexError | NotFoundError | SessionError,
  void
>;

export const UPDATE_EVENT = "update" as const;

export type UpdateEventParams = WithId<Session>;

export type UpdateEventResponse = E.Either<never, void>;

export const MESSAGE_EVENT = "message" as const;

export type MessageEventParams = {
  sessionId: string;
  message: string;
};

export type MessageEventResponse = E.Either<
  MutexError | NotFoundError | SessionError,
  void
>;

export type MessageEventBroadcastParams = {
  message: string;
  playerName: string;
  kind: "correct" | "guess";
};

export const START_EVENT = "start" as const;

export type StartEventParams = { sessionId: string };

export type StartEventResponse = E.Either<MutexError | SessionError, void>;
