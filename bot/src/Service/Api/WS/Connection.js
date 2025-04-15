import DialogsList from "./Methods/DialogsList.js";
import DialogMessages from "./Methods/DialogMessages.js";
import DialogSendMessage from "./Methods/DialogSendMessage.js";

class Connection {

  /**
   *  response = {
   *    type: "accounts",
   *    data: []
   *  };
   */
  static async run(wsClient, request, telegramBotService, socialsAgentService) {
    const requestUrl = new URL(request.url, `https://${request.headers.host}`);
    const telegramUserId = requestUrl.searchParams.get('userId');

    const telegramUserData = await (await telegramBotService.getStorage()).getUser(telegramUserId);
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

    wsClient.on('message', (message) => {
      const payload = JSON.parse(message);
      switch (payload.type) {
        case 'dialogs_list':
          DialogsList.run(wsClient, telegramUserId, payload, telegramBotService, socialsAgentService);
          break;
        case 'dialog_messages':
          DialogMessages.run(wsClient, telegramUserId, payload, telegramBotService, socialsAgentService);
          break;
        case 'dialog_send_message':
          DialogSendMessage.run(wsClient, telegramUserId, payload, telegramBotService, socialsAgentService);
          break;
      }
    })
  }

}

export default Connection