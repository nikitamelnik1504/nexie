const HTTP_API_URL = 'https://apiv3.ton.place';

class AccountWatcher {

  page;

  account = {
    token: null,
    username: null,
    id: null
  };

  constructor(page) {
    this.page = page;
  }

  static async init(page) {
    const instance = new this(page);

    instance.page.on('request', async (request) => {
      if (request.url() === HTTP_API_URL + '/main/init' && request.headers().authorization) {
        instance.account.token = request.headers().authorization;
      }

      request.continue()
    })

    instance.page.on('response', async (response) => {
      if (response.url() === HTTP_API_URL + '/main/init' && response.headers()['content-type'] === 'text/plain; charset=utf-8') {
        const responseBody = JSON.parse(await response.text());
        instance.account.username = responseBody.user.firstName;
        instance.account.id = responseBody.user.id;
      }
    })

    return instance;
  }

  getAccount() {
    return this.account;
  }
}

export default AccountWatcher;