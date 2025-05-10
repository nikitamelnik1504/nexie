import Connection from "../Connection.js";

function prepareResponseData(dialogs) {
  const response = [];

  for (const dialog of dialogs) {
    const lastMessage = dialog.getMessages().lastMessage();
    response.push({
      id: dialog.id,
      lastMessage: {
        text: lastMessage ? lastMessage.text : null,
        timestamp: lastMessage ? lastMessage.timestamp : null,
        from: lastMessage ? lastMessage.from.id : null,
      },
      member: {
        id: dialog.member.id,
        username: dialog.member.username,
      },
      unreadMessagesCount: 0,
    });
  }

  return response;
}

class DialogsList {

  static async run(wsClient, telegramUserId, payload, telegramBotService, socialsAgentService) {
    const telegramUserData = await (await telegramBotService.getStorage()).getUserByUsername(telegramUserId);

    const response = {
      type: "dialogsList",
      accountId: null,
      me: null,
      data: [],
    };

    const socialAgentAccountId = telegramUserData.social_agent_accounts.find(id => id === payload.accountId);
    if (!socialAgentAccountId) return;

    const socialAgentAccount = socialsAgentService.getAccount(socialAgentAccountId);

    const socialAgentAccountMessenger = await socialAgentAccount.getPlatformMessenger();

    if (!socialAgentAccountMessenger) {
      return;
    }

    const listener = (data) => {
      response.accountId = socialAgentAccount.id;
      response.me = socialAgentAccountMessenger.getMe().id;
      response.data = prepareResponseData(data);
      wsClient.send(JSON.stringify(response));
    };

    Connection.registerListener(wsClient, socialAgentAccountMessenger, 'dialogsList', listener);

    const dialogs = socialAgentAccountMessenger.getDialogs().list(0, 30); // @todo Hardcoded pagination.
    if (dialogs.length > 0) {
      listener(dialogs);
    }
  }

}

export default DialogsList;