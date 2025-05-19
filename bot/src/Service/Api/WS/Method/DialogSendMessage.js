import Connection from "../Connection.js";

function prepareResponseData(message) {
  return {
    id: message.id,
    from: message.from.id,
    timestamp: message.timestamp,
    text: message.text,
  };
}

class DialogSendMessage {

  static async run(wsClient, telegramUserId, payload, telegramBotService, socialsAgentService) {
    const telegramUserData = await (await telegramBotService.getStorage()).getUserByUsername(telegramUserId);

    const response = {
      type: "dialogSendMessage",
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

    const listener = (data) => {
      response.accountId = socialAgentAccount.id;
      response.dialogId = data._collection._dialog.id;
      response.data = prepareResponseData(data);
      wsClient.send(JSON.stringify(response));
    }

    Connection.registerListener(wsClient, socialAgentAccountMessenger, 'messageSent', listener);

    const dialogMessages = socialAgentAccountMessenger.getDialogs().dialog(payload.dialogId).getMessages();

    if (dialogMessages) {
      dialogMessages.addMessage(socialAgentAccountMessenger.getFactory().createMessage(dialogMessages, payload.data));
    }
  }

}

export default DialogSendMessage;