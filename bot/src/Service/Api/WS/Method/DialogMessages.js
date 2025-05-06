import Connection from "../Connection.js";

function prepareResponseData(messages) {
  const response = [];

  for (const message of messages) {
    response.push({
      id: message.id,
      from: message.from.id,
      timestamp: message.timestamp,
      text: message.text,
    });
  }

  return response;
}

class DialogMessages {

  // RESPONSE = {
  //   type: "dialogMessages",
  //   data: []
  // }

  static async run(wsClient, telegramUserId, payload, telegramBotService, socialsAgentService) {
    const telegramUserData = await (await telegramBotService.getStorage()).getUserByUsername(telegramUserId);

    const response = {
      type: "dialogMessages",
      accountId: null,
      dialogId: null,
      page: null,
      data: []
    };

    const socialAgentAccountId = telegramUserData.social_agent_accounts.find(id => id === payload.data.accountId);
    if (!socialAgentAccountId) return;

    const socialAgentAccount = socialsAgentService.getAccount(socialAgentAccountId);

    const socialAgentAccountMessenger = await socialAgentAccount.getPlatformMessenger();

    if (!socialAgentAccountMessenger) {
      return;
    }

    const listener = (data) => {
      response.accountId = socialAgentAccount.id;
      response.dialogId = data[0]._collection._dialog.id;
      response.data = prepareResponseData(data);
      wsClient.send(JSON.stringify(response));
    };

    Connection.registerListener(wsClient, socialAgentAccountMessenger, 'messagesList', listener);

    if (socialAgentAccountMessenger.getDialogs().dialog(payload.data.dialogId).getMessages().synced === true) {
      listener(socialAgentAccountMessenger.getDialogs().dialog(payload.data.dialogId).getMessages().list());
    } else {
      socialAgentAccountMessenger.getDialogs().dialog(payload.data.dialogId).getMessages().list()
    }
  }

}

export default DialogMessages;