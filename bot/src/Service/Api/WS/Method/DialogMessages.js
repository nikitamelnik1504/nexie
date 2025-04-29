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

    const socialAgentId = telegramUserData.social_agent_accounts.find(id => id === payload.data.accountId);
    if (!socialAgentId) return;

    const socialAgentAccount = socialsAgentService.getAccount(socialAgentId);

    const socialAgentAccountMessenger = await socialAgentAccount.getPlatformMessenger();

    socialAgentAccountMessenger.removeAllListeners('dialog_messages_update');
    socialAgentAccountMessenger.on('dialog_messages_update', () => this.run(wsClient, telegramUserId, payload, telegramBotService, socialsAgentService));

    response.data.messages = socialAgentAccountMessenger.getDialogMessages(payload.data.dialogId);
    if (response.data.messages === false) {
      return;
    }
    response.data.accountId = socialAgentAccount.id;
    response.data.dialogId = payload.data.dialogId;

    wsClient.send(JSON.stringify(response))
  }

}

export default DialogMessages;