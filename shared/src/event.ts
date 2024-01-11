import {
  AlreadyExistsError,
  MutexError,
  NotFoundError,
  SessionError,
  ValidationError,
} from "./error";
import { Point } from "./point";
import * as E from "fp-ts/Either";

export const DRAW_EVENT = "draw" as const;

export type DrawEventParams = {
  start: Point;
  end: Point;
  color: string;
  lineWidth: number;
};

export const CREATE_EVENT = "create" as const;

export type CreateEventParams = {
  ownerName: string;
};

export type CreateEventResponse = E.Either<
  MutexError | ValidationError | AlreadyExistsError,
  { sessionId: string }
>;

export const JOIN_EVENT = "join" as const;

export type JoinEventParams = {
  sessionId: string;
  playerName: string;
};

export type JoinEventResponse = E.Either<
  MutexError | ValidationError | NotFoundError | SessionError,
  void
>;

export const DISCONNECT_EVENT = "disconnect" as const;

export type DisconnectEventParams = {};

export type DisconnectEventResponse = E.Either<
  MutexError | NotFoundError | SessionError,
  void
>;
