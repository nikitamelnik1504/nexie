import { setupListener, cleanupUserListeners } from '../utils/listeners.js';

import dialogsListHandler from './dialogsListHandler.js';
import dialogMessagesHandler from './dialogMessagesHandler.js';
import dialogSendMessageHandler from './dialogSendMessageHandler.js';
import albumsListHandler from './albumsListHandler.js';
import albumMediasListHandler from './albumMediasListHandler.js';
import authenticateHandler from './authenticateHandler.js';

export default function registerSocketHandlers({ io, socialsAgentService, userListeners }) {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('authenticate', async (data) =>
      authenticateHandler({ socket, data, socialsAgentService, setupListener: (...args) => setupListener(userListeners, ...args) })
    );

    socket.on('dialogsList', (payload) =>
      dialogsListHandler({ socket, payload, socialsAgentService, setupListener: (...args) => setupListener(userListeners, ...args) })
    );

    socket.on('dialogMessages', (payload) =>
      dialogMessagesHandler({ socket, payload, socialsAgentService, setupListener: (...args) => setupListener(userListeners, ...args) })
    );

    socket.on('dialogSendMessage', (payload) =>
      dialogSendMessageHandler({ socket, payload, socialsAgentService, setupListener: (...args) => setupListener(userListeners, ...args) })
    );

    socket.on('albumsList', (payload) =>
      albumsListHandler({ socket, payload, socialsAgentService, setupListener: (...args) => setupListener(userListeners, ...args) })
    );

    socket.on('albumMediasList', (payload) =>
      albumMediasListHandler({ socket, payload, socialsAgentService, setupListener: (...args) => setupListener(userListeners, ...args) })
    );

    socket.on('disconnect', () => {
      if (socket.userId) {
        console.log(`User ${socket.userId} disconnected`);
        cleanupUserListeners(userListeners, socket.userId);
      }
    });
  });
}