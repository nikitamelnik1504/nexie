import { Server } from 'socket.io';
import registerSocketHandlers from './socket/handlers/index.js';

export default function initSocket({ server, socialsAgentService }) {
  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  const userListeners = new Map();

  registerSocketHandlers({
    io,
    socialsAgentService,
    userListeners,
  });

  return io;
}