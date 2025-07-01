import Connection from "../Connection.js";

function prepareResponseData(data) {

}

class MyPhotos {

  static async run(wsClient, telegramUserId, payload, telegramBotService, socialsAgentService) {
    const telegramUserData = await (await telegramBotService.getStorage()).getUserByUsername(telegramUserId);

    const response = {
      type: "myPhotos",
      accountId: null,
      me: null,
      data: [],
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
      response.me = socialAgentAccountMessenger.getMe().id;
      response.data = prepareResponseData(data);
      wsClient.send(JSON.stringify(response));
    };

    Connection.registerListener(wsClient, socialAgentAccountMessenger, 'myPhotos', listener);

    const photos = socialAgentAccountMessenger.getPhotos().list(0, 2);
    if (photos.length > 0) {
      listener(photos);
    }
  }

}

export default MyPhotos;