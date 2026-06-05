import { Server, Socket } from 'socket.io';
import http from 'http';
import config from '../config/index.js';

let io: Server;

export const initSocket = (server: http.Server): Server => {
  io = new Server(server, {
    cors: {
      origin: config.clientUrl,
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    // User তার userId দিয়ে নিজের room-এ join করবে
    socket.on('join', (userId: string) => {
      socket.join(userId);
    });

    socket.on('disconnect', () => {});
  });

  return io;
};

// অন্য module থেকে: import { getIO } from '../../socket/index.js'
export const getIO = (): Server => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};
