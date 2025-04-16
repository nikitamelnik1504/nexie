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

    socialAgentAccountMessenger.sendDialogMessage(payload.data);

    socialAgentAccountMessenger.removeAllListeners('dialog_message_sent');
    socialAgentAccountMessenger.on('dialog_message_sent', (message) => {
      response.data.accountId = socialAgentAccount.id;
      response.data.dialogId = payload.data.dialogId;
      response.data.message = message;
      wsClient.send(JSON.stringify(response));
    });
  }

}

export default DialogSendMessage;