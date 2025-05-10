import EventEmitter from "node:events";

class DialogsWatcher extends EventEmitter {

  page;

  account;

  constructor(page, account) {
    super();
    this.page = page;
    this.account = account;
  }

  static async init(page, account) {
    const instance = new this(page, account);

    await this.createWsConnection(instance);

    instance.page.exposeFunction("formatDialogs", this.formatDialogs.bind(instance));
    instance.page.exposeFunction("dialogsWatcherEmit", instance.emit.bind(instance));

    return instance;
  }

  async requestDialogs(startFrom) {
    return this.page.evaluate(async (accessToken, startFrom) => {
      const requestBody = {
        section: "all",
        startFrom,
      };

      fetch('https://api.ton.place/im', {
        method: 'POST',
        headers: {
          'Authorization': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }).then(async (response) => {
        await window.dialogsWatcherEmit("dialogsList", await window.formatDialogs(await response.json()));
      });
    }, this.account.token, startFrom)
  }

  static async createWsConnection(instance) {
    const ws = await new Promise(async (resolve) => {
      await instance.page.evaluate((accessToken) => {
        return new Promise((resolveBrowser) => {
          window.ws = new WebSocket('wss://api.ton.place/ws?access_token=' + accessToken); // Store WebSocket globally
          resolveBrowser(true); // Resolve promise on successful authentication
        });
      }, instance.account.token);

      resolve();
    });

    return ws;
  }

  static formatDialogs(responseBody) {
    const result = {
      list: [],
      nextFrom: 0,
    };

    for (const dialog of responseBody.dialogs) {
      const dialogPrepared = {
        ...dialog,
        messages: [
          responseBody.messages.find(message => message.id === dialog.lastMsgId)
        ],
        user: null,
      };

      for (const user_id in responseBody.users) {
        if (+responseBody.users[user_id].id === +dialogPrepared.messages[0].fromId || +responseBody.users[user_id].id === +dialogPrepared.messages[0].toId) {
          dialogPrepared.user = responseBody.users[user_id];
        }
      }

      result.list.push(dialogPrepared);
    }

    result.nextFrom = responseBody.nextFrom;

    return result;
  }
}

export default DialogsWatcher;