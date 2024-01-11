import { Injectable, isDevMode } from '@angular/core';
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
} from '@pictionary/shared';
import { io } from 'socket.io-client';
import { emitter } from '../util/socket-util';
import { Subject } from 'rxjs';
import * as E from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/lib/function';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket = isDevMode() ? io(`localhost:${config.serverPort}`) : io();
  token?: string;

  public drawEventSubject = new Subject<DrawEventParams>();

  constructor() {
    this.socket.on('connect', this.handleConnectEvent);
    this.socket.on(DRAW_EVENT, this.handleDrawEvent);
  }

  private handleConnectEvent = () => {};

  private handleDrawEvent = (params: DrawEventParams) =>
    this.drawEventSubject.next(params);

  private handleCreateAndJoinEventResponse: (
    res: CreateEventResponse | JoinEventResponse
  ) => void = E.match(flow(JSON.stringify, console.log), (res) => {
    this.token = res.token;
  });

  public emitDraw = emitter<DrawEventParams>(this.socket, DRAW_EVENT);

  public emitCreate = emitter<CreateEventParams>(
    this.socket,
    CREATE_EVENT,
    this.handleCreateAndJoinEventResponse
  );

  public emitJoin = emitter<JoinEventParams>(
    this.socket,
    JOIN_EVENT,
    this.handleCreateAndJoinEventResponse
  );
}
