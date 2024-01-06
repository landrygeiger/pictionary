import { Injectable, isDevMode } from '@angular/core';
import { config } from '@pictionary/shared';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket = isDevMode() ? io(`localhost:${config.serverPort}`) : io();

  constructor() {
    this.socket.on('connect', this.handleConnect);
  }

  private handleConnect() {}

  public isConnected() {
    return this.socket.connected;
  }
}
