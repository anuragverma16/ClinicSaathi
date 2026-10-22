import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { env } from '../config/env';

let io: Server | null = null;

export const initSockets = (server: HttpServer): Server => {
  io = new Server(server, { cors: { origin: env.CLIENT_URL, credentials: true } });
  io.on('connection', (socket) => {
    socket.on('queue:join', (clinicId: string) => socket.join(`clinic:${clinicId}`));
  });
  return io;
};

/** Called by queue service after every queue change so all screens update. */
export const emitQueueUpdate = (clinicId: string, payload: unknown): void => {
  io?.to(`clinic:${clinicId}`).emit('queue:updated', payload);
};
