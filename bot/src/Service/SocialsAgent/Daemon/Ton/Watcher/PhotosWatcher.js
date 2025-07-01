import EventEmitter from "node:events";

const HTTP_API_URL = 'https://api.tonplace.net';

class PhotosWatcher extends EventEmitter {

  page;

  account;

  constructor(page, account) {
    super();
    this.page = page;
    this.account = account;
  }

  static async init(page, account) {
    const instance = new this(page, account);

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
        console.log(await response.json())
      });
    }, this.account.token, HTTP_API_URL);
  }

}

export default PhotosWatcher;