import EventEmitter from "node:events";

const HTTP_API_URL = 'https://api.tonplace.net';
const WS_API_URL = 'wss://api.tonplace.net';

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
    return this.page.evaluate(async (accessToken, startFrom, httpApiUrl) => {
      const requestBody = {
        section: "all",
        startFrom,
      };

      fetch(httpApiUrl + '/im', {
        method: 'POST',
        headers: {
          'Authorization': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }).then(async (response) => {
        await window.dialogsWatcherEmit("dialogsList", await window.formatDialogs(await response.json()));
      });
    }, this.account.token, startFrom, HTTP_API_URL)
  }

  static async createWsConnection(instance) {
    await instance.page.evaluate((accessToken, wsApiUrl) => {
      function connect() {
        if (window.ws) {
          try {
            window.ws.close();
          } catch (e) {
            console.warn('[WS] Error closing socket:', e);
          }
        }

        window.ws = new WebSocket(wsApiUrl + '/ws?access_token=' + accessToken);

        const event = new CustomEvent('wsReconnected');
        window.dispatchEvent(event);
      }

      connect();

      if (window.wsReconnectTimer) {
        clearInterval(window.wsReconnectTimer);
      }
      window.wsReconnectTimer = setInterval(connect, 9 * 60 * 1000);

    }, instance.account.token, WS_API_URL);
  }

  static formatDialogs(responseBody) {
    const result = {
      list: [],
      nextFrom: 0,
    };

    for (const dialog of responseBody.dialogs) {
      const lastMessage = responseBody.messages.find(message => message.id === dialog.lastMsgId)

      const dialogPrepared = {
        ...dialog,
        messages: lastMessage ? [lastMessage] : [],
        user: null,
      };

      for (const user_id in responseBody.users) {
        if (+responseBody.users[user_id].id === +dialogPrepared.peerId) {
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