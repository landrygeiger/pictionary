import { Socket } from 'socket.io-client';

export const emitter =
  <EventParams, Response = never>(
    io: Socket,
    event: string,
    cb?: (response: Response) => void
  ) =>
  (params: EventParams) => {
    cb ? io.emit(event, params, cb) : io.emit(event, params);
  };
