import EventEmitter from "node:events";

const HTTP_API_URL = 'https://api.tonplace.net';

class MediaWatcher extends EventEmitter {

  page;

  account;

  constructor(page, account) {
    super();
    this.page = page;
    this.account = account;
  }

  static async init(page, account) {
    const instance = new this(page, account);

    instance.page.exposeFunction("mediaWatcherEmit", instance.emit.bind(instance));

    return instance;
  }

  async requestAlbums() {
    return this.page.evaluate(async (accessToken, httpApiUrl) => {
      fetch(httpApiUrl + '/albums', {
        method: 'GET',
        headers: {
          'Authorization': accessToken,
          'Content-Type': 'application/json',
        },
      }).then(async (response) => {
        await window.mediaWatcherEmit("albumsList", {list: (await response.json()).albums});
      });
    }, this.account.token, HTTP_API_URL);
  }

  /**
   * @todo MemberId param as peerId for API to check if media already bought.
   */
  async requestMedia(albumId, startFrom) {
    return this.page.evaluate(async (accessToken, httpApiUrl, albumId, startFrom) => {
      fetch(httpApiUrl + `/albums/${albumId}?desc=true&startFrom=${startFrom}`, {
        method: 'GET',
        headers: {
          'Authorization': accessToken,
          'Content-Type': 'application/json',
        }
      }).then(async (response) => {
        await window.mediaWatcherEmit("albumMediasList", {list: (await response.json()).elements, albumId});
      });
    }, this.account.token, HTTP_API_URL, albumId, startFrom);
  }

}

export default MediaWatcher;