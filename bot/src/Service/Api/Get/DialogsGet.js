import {WebSocketServer} from "ws";

class DialogsGet {

  wsServers = [];

  constructor(telegramBotService, socialsAgentService) {
    this.telegramBotService = telegramBotService;
    this.socialsAgentService = socialsAgentService;
  }

  async ws(req, res) {
    const telegramUserId = req.params.userId;

    const existWsServer = this.wsServers.find(server => server.telegram_user_id === telegramUserId);
    if (existWsServer) {
      return existWsServer.server.address();
    }

    const telegramUserData = await (await this.telegramBotService.getStorage()).getUser(telegramUserId);

    const wsServer = new WebSocketServer({
      port: 3002
    });

    for (const socialAgentId of telegramUserData.social_agent_accounts) {
      const socialAgentAccount = this.socialsAgentService.getAccount(socialAgentId);
      const socialAgentDialogsEventListener = await socialAgentAccount.getPlatformDialogsList();
    }

    this.wsServers.push({
      telegram_user_id: telegramUserId,
      server: wsServer
    })
  }

}

export default DialogsGet;