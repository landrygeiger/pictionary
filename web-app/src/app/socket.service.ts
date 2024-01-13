import { Injectable, isDevMode } from "@angular/core";
import {
  CREATE_EVENT,
  CreateEventParams,
  CreateEventResponse,
  DRAW_EVENT,
  DrawEventParams,
  JOIN_EVENT,
  JoinEventParams,
  JoinEventResponse,
  config,
} from "@pictionary/shared";
import { io } from "socket.io-client";
import { emitter } from "../util/socket-util";
import { Subject } from "rxjs";
import * as E from "fp-ts/Either";
import { constVoid, flow, pipe } from "fp-ts/lib/function";

@Injectable({
  providedIn: "root",
})
export class SocketService {
  private socket = isDevMode() ? io(`localhost:${config.serverPort}`) : io();
  sessionId?: string;

  public drawEventSubject = new Subject<DrawEventParams>();

  constructor() {
    this.socket.on("connect", this.handleConnectEvent);
    this.socket.on(DRAW_EVENT, this.handleDrawEvent);
  }

  private handleConnectEvent = () => {};

  private handleDrawEvent = (params: DrawEventParams) =>
    this.drawEventSubject.next(params);

  private handleCreateEventResponse: (res: CreateEventResponse) => void =
    E.match(flow(JSON.stringify, console.log), res => {
      this.sessionId = res.sessionId;
    });

  private handleJoinEventResponse: (res: JoinEventResponse) => void = E.match(
    flow(JSON.stringify, console.log),
    constVoid,
  );

  public emitDraw = emitter<DrawEventParams>(this.socket, DRAW_EVENT);

  public emitCreate = emitter<CreateEventParams>(
    this.socket,
    CREATE_EVENT,
    this.handleCreateEventResponse,
  );

  public emitJoin = emitter<JoinEventParams>(
    this.socket,
    JOIN_EVENT,
    this.handleJoinEventResponse,
  );
}
