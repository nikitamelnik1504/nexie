class DialogMessageNew {

  static async run(wsClient, telegramUserId, payload, telegramBotService, socialsAgentService) {
    const telegramUserData = await (await telegramBotService.getStorage()).getUser(telegramUserId);

    const response = {
      type: "dialog_message_new",
      data: {
        accountId: null,
        dialogId: null,
        message: null,
      }
    };

    for (const socialAgentId of telegramUserData.social_agent_accounts) {
      const socialAgentAccount = socialsAgentService.getAccount(socialAgentId);
      const socialAgentAccountMessenger = await socialAgentAccount.getPlatformMessenger();

      socialAgentAccountMessenger.removeAllListeners('dialog_message_new');
      socialAgentAccountMessenger.on('dialog_message_new', (message) => {
        response.data.accountId = socialAgentAccount.id;
        response.data.dialogId = message._collection._dialog.id;
        response.data.message = message;

        wsClient.send(JSON.stringify(response));
      });
    }
  }
}

export default DialogMessageNew;