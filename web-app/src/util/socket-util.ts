import { Socket } from 'socket.io-client';

export const emitter =
  <EventParams>(io: Socket, event: string) =>
  (params: EventParams) => {
    io.emit(event, params);
  };
