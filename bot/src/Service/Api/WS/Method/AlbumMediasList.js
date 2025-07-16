import Connection from "../Connection.js";
import VideoBase from "../../../SocialsAgent/lib/Messenger/VideoBase.js";
import ImageBase from "../../../SocialsAgent/lib/Messenger/ImageBase.js";

function prepareResponseData(data) {
  const response = [];

  for (const albumItem of data) {
    const media = albumItem.getMedia();

    const response_item = {
      id: media.id,
      src: media.src,
      timestamp: albumItem.timestamp,
      type: null,
    };

    if (media instanceof VideoBase) {
      response_item.type = 'video';
    } else if (albumItem.media instanceof ImageBase) {
      response_item.type = 'image';
    }

    response.push(response_item);
  }

  return response;
}

class AlbumMediasList {

  static async run(wsClient, telegramUserId, payload, telegramBotService, socialsAgentService) {
    const telegramUserData = await (await telegramBotService.getStorage()).getUserByUsername(telegramUserId);

    const response = {
      type: "albumMediasList",
      accountId: null,
      albumId: null,
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
      response.albumId = data[0]._collection._album.id;
      response.data = prepareResponseData(data);
      wsClient.send(JSON.stringify(response));
    };

    Connection.registerListener(wsClient, socialAgentAccountMessenger, 'albumMediasList', listener);

    const album = socialAgentAccountMessenger.getAlbums().album(payload.albumId);
    if (!album) {
      return
    }

    const albumItems = album.getItems().list(0, 30);
    if (albumItems.length > 0) {
      listener(albumItems);
    }
  }

}

export default AlbumMediasList;