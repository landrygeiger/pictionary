import {
  AlreadyExistsError,
  MutexError,
  NotFoundError,
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
  {
    token: string;
  }
>;

export const JOIN_EVENT = "join" as const;

export type JoinEventParams = {
  sessionId: string;
  playerName: string;
};

export type JoinEventResponse = E.Either<
  MutexError | ValidationError | NotFoundError,
  { token: string }
>;
