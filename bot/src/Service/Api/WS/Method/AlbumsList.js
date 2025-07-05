import Connection from "../Connection.js";

function prepareResponseData(data) {
  const response = [];

  for (const album of data) {
    response.push({
      id: album.id,
      title: album.title,
      coverUrl: album.coverUrl,
      timestamp: album.timestamp,
    })
  }

  return response;
}

class AlbumsList {

  static async run(wsClient, telegramUserId, payload, telegramBotService, socialsAgentService) {
    const telegramUserData = await (await telegramBotService.getStorage()).getUserByUsername(telegramUserId);

    const response = {
      type: "albumsList",
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

    Connection.registerListener(wsClient, socialAgentAccountMessenger, 'albumsList', listener);

    const albums = socialAgentAccountMessenger.getAlbums().list(0, 30);
    if (albums.length > 0) {
      listener(albums);
    }
  }

}

export default AlbumsList;