import { Point } from "./point";

export const DRAW_EVENT = "draw" as const;

export type DrawEventParams = {
  start: Point;
  end: Point;
};
