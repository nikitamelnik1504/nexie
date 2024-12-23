class DialogsGet {

  wsServer;

  constructor(wsServer, telegramBotService, socialsAgentService) {
    this.wsServer = wsServer;
    this.telegramBotService = telegramBotService;
    this.socialsAgentService = socialsAgentService;
  }

  static async init(wsServer, telegramBotService, socialsAgentService) {
    const instance = new this(wsServer, telegramBotService, socialsAgentService);

    wsServer.on('connection', async (wsClient, request) => {
      const url = new URL(request.url, `https://${request.headers.host}`);
      const userId = url.searchParams.get('userId');
      const telegramUserData = await (await instance.telegramBotService.getStorage()).getUser(userId);
      if (!telegramUserData) {
        return wsClient.close();
      }

      for (const socialAgentId of telegramUserData.social_agent_accounts) {
        const socialAgentAccount = instance.socialsAgentService.getAccount(socialAgentId);
        const socialAgentDialogsEventListener = await socialAgentAccount.getPlatformDialogsListener();
        socialAgentDialogsEventListener.removeAllListeners('update');
        socialAgentDialogsEventListener.on('update', (dialogs) => {
          wsClient.send(JSON.stringify({
            type: "dialogs_list",
            data: {
              platform: socialAgentAccount.getPlatformType(),
              dialogs,
            },
          }));
        });

        const dialogs = socialAgentAccount.getPlatformDialogs();
        if (dialogs === null) {
          continue;
        }
        wsClient.send(JSON.stringify({
          type: "dialogs_list",
          data: {
            platform: socialAgentAccount.getPlatformType(),
            dialogs,
          },
        }));
      }
    });

    return instance;
  }

  async ws(req, res) {
    return res.send(this.wsServer.address());
  }

}

export default DialogsGet;