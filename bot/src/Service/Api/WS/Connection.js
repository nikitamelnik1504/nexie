import DialogsList from "./Method/DialogsList.js";
import DialogMessages from "./Method/DialogMessages.js";
import DialogSendMessage from "./Method/DialogSendMessage.js";
import DialogMessageNew from "./Method/DialogMessageNew.js";
import MyPhotos from "./Method/MyPhotos.js";

class Connection {
  static listeners = new WeakMap();

  /**
   *  response = {
   *    type: "accounts",
   *    data: []
   *  };
   */
  static async run(wsClient, request, telegramBotService, socialsAgentService) {
    const requestUrl = new URL(request.url, `https://${request.headers.host}`);
    const telegramUserId = requestUrl.searchParams.get('userId');

    const telegramUserData = await (await telegramBotService.getStorage()).getUserByUsername(telegramUserId);
    if (!telegramUserData) {
      return wsClient.close();
    }

    const response = {
      type: "accounts", data: [],
    };

    for (const socialAgentId of telegramUserData.social_agent_accounts) {
      const socialAgentAccount = socialsAgentService.getAccount(socialAgentId);
      response.data.push({
        id: socialAgentAccount.id,
        username: socialAgentAccount.getPlatformUsername(),
        platform: socialAgentAccount.getPlatformType(),
      });
    }
    wsClient.send(JSON.stringify(response));

    wsClient.on("close", () => this.cleanupListeners(wsClient));

    wsClient.on('message', (message) => {
      const payload = JSON.parse(message);
      switch (payload.type) {
        case 'dialogsList':
          DialogsList.run(wsClient, telegramUserId, payload, telegramBotService, socialsAgentService);
          DialogMessageNew.run(wsClient, telegramUserId, payload, telegramBotService, socialsAgentService);
          break;
        case 'dialogMessages':
          DialogMessages.run(wsClient, telegramUserId, payload, telegramBotService, socialsAgentService);
          break;
        case 'dialogSendMessage':
          DialogSendMessage.run(wsClient, telegramUserId, payload, telegramBotService, socialsAgentService);
          break;
        case 'myPhotos':
          MyPhotos.run(wsClient, telegramUserId, payload, telegramBotService, socialsAgentService);
          break;
      }
    });
  }

  static registerListener(wsClient, platformMessenger, eventType, listener) {
    if (!Connection.listeners.has(wsClient)) {
      Connection.listeners.set(wsClient, []);
    }

    const listeners = Connection.listeners.get(wsClient);

    if (listeners.some(entry => entry.platformMessenger === platformMessenger && entry.eventType === eventType)) {
      return;  // Listener already exists, skip.
    }

    const wrappedListener = (data) => listener(data);

    listeners.push({ platformMessenger, eventType, listener: wrappedListener });
    platformMessenger.on(eventType, wrappedListener);
  }

  static cleanupListeners(wsClient) {
    const listeners = Connection.listeners.get(wsClient);
    if (listeners) {
      listeners.forEach(({ platformMessenger, eventType, listener }) => {
        platformMessenger.removeListener(eventType, listener);
      });
      Connection.listeners.delete(wsClient);
    }
  }
}

export default Connection;