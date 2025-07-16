import EventEmitter from "node:events";

const HTTP_API_URL = 'https://api.tonplace.net';

class MessagesWatcher extends EventEmitter {

  page;

  account;

  constructor(page, account) {
    super();
    this.page = page;
    this.account = account;
  }

  static async init(page, account) {
    const instance = new this(page, account);

    await this.extendWsConnection(instance);

    instance.page.exposeFunction("requestMessages", instance.requestMessages.bind(instance));
    instance.page.exposeFunction("formatMessages", this.formatMessages.bind(instance));
    instance.page.exposeFunction("formatMessage", this.formatMessage.bind(instance));
    instance.page.exposeFunction("messagesWatcherEmit", instance.emit.bind(instance));

    return instance;
  }

  static async extendWsConnection(instance) {
    await instance.page.evaluate(async (memberId) => {
      window.ws.addEventListener("message", async (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'message':
            if (data.body.message.fromId === memberId) {
              return;
            }

            await window.messagesWatcherEmit("messageNew", window.formatMessage(data.body))
            break;
        }
      });
    }, instance.account.id)
  }

  async requestMessages(memberId, startFrom) {
    return this.page.evaluate(async (accessToken, memberId, startFrom, httpApiUrl) => {
      const requestBody = {
        startFrom,
      };

      fetch(httpApiUrl + '/im/' + memberId + '/history', {
        method: 'POST',
        headers: {
          'Authorization': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }).then(async (response) => {
        await window.messagesWatcherEmit("messagesList", {
          ...await window.formatMessages(await response.json()),
          memberId
        });
      });
    }, this.account.token, memberId, startFrom, HTTP_API_URL);
  }

  async sendMessage(memberId, message, attachments = [], _bag) {
    return this.page.evaluate(async (accessToken, memberId, message, attachments, _bag, httpApiUrl) => {
      const requestBody = {
        attachments,
        randomId: -1,
        text: message
      };

      fetch(httpApiUrl + '/im/' + memberId + '/send', {
        method: 'POST',
        headers: {
          'Authorization': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }).then(async (response) => {
        await window.messagesWatcherEmit("messageSent", {
          ...await window.formatMessage(await response.json()),
          memberId,
        }, _bag);
      });
    }, this.account.token, memberId, message, attachments, _bag, HTTP_API_URL);
  }

  static formatMessages(responseBody) {
    return {
      list: responseBody.history,
      nextFrom: responseBody.nextFrom,
    };
  }

  static formatMessage(responseBody) {
    return responseBody.message;
  }

}

export default MessagesWatcher;