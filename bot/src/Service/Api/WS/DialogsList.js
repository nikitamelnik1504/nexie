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
      const socialAgentDialogsEventListener = await socialAgentAccount.getPlatformDialogsListener();
      socialAgentDialogsEventListener.removeAllListeners('update');
      socialAgentDialogsEventListener.on('update', () => this.run(wsClient, telegramUserId, payload, telegramBotService, socialsAgentService));

      try {
        responseItem.dialogs = socialAgentAccount.getPlatformDialogs();
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