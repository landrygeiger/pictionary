import { Injectable, isDevMode } from '@angular/core';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket = isDevMode() ? io('localhost:5555') : io();

  constructor() {
    this.socket.on('connect', this.handleConnect);
  }

  private handleConnect() {}

  public isConnected() {
    return this.socket.connected;
  }
}
