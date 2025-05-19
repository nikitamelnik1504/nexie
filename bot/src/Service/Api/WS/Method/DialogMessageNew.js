import Connection from "../Connection.js";

function prepareResponseData(message) {
  return {
    id: message.id,
    from: message.from.id,
    timestamp: message.timestamp,
    text: message.text,
  };
}

class DialogMessageNew {

  static async run(wsClient, telegramUserId, payload, telegramBotService, socialsAgentService) {
    const telegramUserData = await (await telegramBotService.getStorage()).getUserByUsername(telegramUserId);

    const response = {
      type: "dialogMessageNew",
      accountId: null,
      dialogId: null,
      data: null,
    };

    const socialAgentAccountId = telegramUserData.social_agent_accounts.find(id => id === payload.accountId);
    if (!socialAgentAccountId) return;

    const socialAgentAccount = socialsAgentService.getAccount(socialAgentAccountId);
    const socialAgentAccountMessenger = await socialAgentAccount.getMessenger();
    if (!socialAgentAccountMessenger) {
      return;
    }

    const listener = (message) => {
      response.accountId = socialAgentAccount.id;
      response.dialogId = message._collection._dialog.id;
      response.data = prepareResponseData(message);
      wsClient.send(JSON.stringify(response));
    }

    Connection.registerListener(wsClient, socialAgentAccountMessenger, 'messageNew', listener);
  }
}

export default DialogMessageNew;