class DialogsList {

  // RESPONSE = {
  //   type: "dialogs_list",
  //   data: []
  // };

  static async run(wsClient, telegramUserId, payload, telegramBotService, socialsAgentService) {
    const telegramUserData = await (await telegramBotService.getStorage()).getUser(telegramUserId);

    const response = {
      type: "dialogs_list",
      data: []
    };

    for (const socialAgentId of telegramUserData.social_agent_accounts) {
      const responseItem = {accountId: null, dialogs: []};

      const socialAgentAccount = socialsAgentService.getAccount(socialAgentId);
      const socialAgentAccountMessenger = await socialAgentAccount.getPlatformMessenger();
      socialAgentAccountMessenger.removeAllListeners('dialogs_list_loaded'); // @todo Telegram multi-visitors impossibility risk.
      socialAgentAccountMessenger.on('dialogs_list_loaded', () => this.run(wsClient, telegramUserId, payload, telegramBotService, socialsAgentService));

      try {
        responseItem.dialogs = socialAgentAccountMessenger.getDialogs();
      } catch (error) {
        responseItem.dialogs = null;
      }
      responseItem.accountId = socialAgentAccount.id;

      response.data.push(responseItem);
    }

    wsClient.send(JSON.stringify(response));
  }

}

export default DialogsList;