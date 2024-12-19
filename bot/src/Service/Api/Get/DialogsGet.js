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
      return res.send(existWsServer.server.address());
    }

    const telegramUserData = await (await this.telegramBotService.getStorage()).getUser(telegramUserId);
    if (!telegramUserData) {
      return res.send('Error');
    }

    const wsServer = new WebSocketServer({
      port: 3002,
    });

    wsServer.on('connection', async (wsClient) => {
      for (const socialAgentId of telegramUserData.social_agent_accounts) {
        const socialAgentAccount = this.socialsAgentService.getAccount(socialAgentId)
        const socialAgentDialogsEventListener = await socialAgentAccount.getPlatformDialogsListener();
        socialAgentDialogsEventListener.removeAllListeners('update');
        socialAgentDialogsEventListener.on('update', (dialogs) => {
          wsClient.send(JSON.stringify(dialogs));
        });

        wsClient.send(JSON.stringify(socialAgentAccount.getPlatformDialogs()));
      }
    });

    this.wsServers.push({
      telegram_user_id: telegramUserId,
      server: wsServer
    })

    return res.send(wsServer.address());
  }

}

export default DialogsGet;