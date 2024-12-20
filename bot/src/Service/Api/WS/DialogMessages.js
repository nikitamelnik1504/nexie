class DialogMessages {

  // RESPONSE = {
  //   type: "dialog_messages",
  //   data: []
  // }

  static async run(wsClient, telegramUserId, payload, telegramBotService, socialsAgentService) {
    const telegramUserData = await (await telegramBotService.getStorage()).getUser(telegramUserId);

    const response = {
      type: "dialog_messages",
      data: {
        accountId: null,
        dialogId: null,
        messages: null,
      },
    };

    for (const socialAgentId of telegramUserData.social_agent_accounts) {
      if (socialAgentId !== payload.data.accountId) {
        continue;
      }

      const socialAgentAccount = socialsAgentService.getAccount(socialAgentId);
      const socialAgentMessagesEventListener = await socialAgentAccount.getPlatformMessagesListener(payload.data.dialogId);
      socialAgentMessagesEventListener.removeAllListeners('update');
      socialAgentMessagesEventListener.on('update', () => this.run(wsClient, telegramUserId, payload, telegramBotService, socialsAgentService));

      response.data.messages = socialAgentAccount.getPlatformDialogMessages(payload.data.dialogId);
      response.data.accountId = socialAgentAccount.id;
      response.data.dialogId = payload.data.dialogId;

      wsClient.send(JSON.stringify(response))
    }
  }

}

export default DialogMessages;