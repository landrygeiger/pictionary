import { DRAW_EVENT, DrawEventParams } from "@pictionary/shared";
import { Socket } from "socket.io";

const broadcastToAllExceptSender =
  <Params>(event: string) =>
  (socket: Socket) =>
  (params: Params) => {
    socket.broadcast.emit(event, params);
  };

export const handleDrawEvent =
  broadcastToAllExceptSender<DrawEventParams>(DRAW_EVENT);
