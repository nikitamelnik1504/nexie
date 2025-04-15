class DialogSendMessage {

  static async run(wsClient, telegramUserId, payload, telegramBotService, socialsAgentService) {
    const telegramUserData = await (await telegramBotService.getStorage()).getUser(telegramUserId);

    const response = {
      type: "dialog_send_message",
      data: {
        accountId: null,
        dialogId: null,
      },
    };

    const socialAgentId = telegramUserData.social_agent_accounts.find(id => id === payload.data.accountId);
    if (!socialAgentId) return;

    const socialAgentAccount = socialsAgentService.getAccount(socialAgentId);

    const socialAgentAccountMessenger = await socialAgentAccount.getPlatformMessenger();

    socialAgentAccountMessenger.sendMessage(payload.data);

    socialAgentAccountMessenger.removeAllListeners('dialog_send_message');
    socialAgentAccountMessenger.on('dialog_send_message', () => () => {
      response.data.accountId = socialAgentAccount.id;
      response.data.dialogId = payload.data.dialogId;

      wsClient.send(JSON.stringify(response))
    });
  }

}

export default DialogSendMessage;