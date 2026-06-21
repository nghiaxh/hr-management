import { Server as HttpServer } from 'http';
import { DefaultEventsMap, Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from './config.js';

let io: Server;
const userSockets = new Map<string, Set<string>>();

export function setupWebSocket(server: HttpServer, JWT_SECRET: string): Server {
  const io = new Server(server, {
    cors: { origin: config.corsOrigin, credentials: true },
  });

  io.on('connection', (client: Socket) => {
    const token = (client.handshake.auth?.token || client.handshake.query?.token) as string;
    if (!token) {
      client.disconnect();
      return;
    }
    try {
      const payload = jwt.verify(token, config.jwtSecret) as { sub: string };
      const userId = payload.sub;
      if (userId) {
        if (!userSockets.has(userId)) {
          userSockets.set(userId, new Set());
        }
        userSockets.get(userId)!.add(client.id);
        client.join(`user:${userId}`);
      }
    } catch {
      client.disconnect();
    }

    client.on('disconnect', () => {
      for (const [userId, sockets] of userSockets.entries()) {
        if (sockets.has(client.id)) {
          sockets.delete(client.id);
          if (sockets.size === 0) {
            userSockets.delete(userId);
          }
          break;
        }
      }
    });
  });

  return io;
}

export function sendNotification(userId: string, notification: any): void {
  io?.to(`user:${userId}`).emit('notification', notification);
}
