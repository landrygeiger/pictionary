import { Injectable, isDevMode } from '@angular/core';
import { DRAW_EVENT, DrawEventParams, config } from '@pictionary/shared';
import { io } from 'socket.io-client';
import { emitter } from '../util/socket-util';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket = isDevMode() ? io(`localhost:${config.serverPort}`) : io();

  public drawEventSubject = new Subject<DrawEventParams>();

  constructor() {
    this.socket.on('connect', this.handleConnectEvent);
    this.socket.on(DRAW_EVENT, this.handleDrawEvent);
  }

  private handleConnectEvent = () => {};

  private handleDrawEvent = (params: DrawEventParams) =>
    this.drawEventSubject.next(params);

  public emitDraw = emitter<DrawEventParams>(this.socket, DRAW_EVENT);
}
