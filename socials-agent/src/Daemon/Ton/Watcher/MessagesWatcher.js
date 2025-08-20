import EventEmitter from "node:events";

const HTTP_API_URL = 'https://api.tonplace.net';
const MESSAGE_DEDUP_TIMEOUT = 30000;

class MessagesWatcher extends EventEmitter {

  page;
  account;

  store = {
    pendingSentMessages: new Map(),
    messageCounter: 0,
  };

  constructor(page, account) {
    super();
    this.page = page;
    this.account = account;
  }

  static async init(page, account) {
    const instance = new this(page, account);

    await this.extendWsConnection(instance);

    instance.page.exposeFunction("checkPendingMessage", instance.#checkPendingSentMessage.bind(instance));
    instance.page.exposeFunction("markMessageAsPendingSent", instance.#markMessageAsPendingSent.bind(instance));
    instance.page.exposeFunction("removeMessageFromPending", instance.#removeMessageFromPending.bind(instance));
    instance.page.exposeFunction("requestMessages", instance.requestMessages.bind(instance));
    instance.page.exposeFunction("formatMessages", this.formatMessages.bind(instance));
    instance.page.exposeFunction("formatMessage", this.formatMessage.bind(instance));
    instance.page.exposeFunction("messagesWatcherEmit", instance.emit.bind(instance));

    return instance;
  }

  static async extendWsConnection(instance) {
    await instance.page.evaluate(async (accountId) => {
      function attachMessageListener() {
        if (!window.ws) return;
        window.ws.addEventListener("message", async (event) => {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'message':
              const formattedMessage = await window.formatMessage(data.body);
              
              if (formattedMessage.fromId === accountId) {
                // Check if this message matches any pending sent messages
                const isPendingMessage = await window.checkPendingMessage(formattedMessage.text);
                
                if (isPendingMessage) {
                  return; // Skip this message as it will be handled by HTTP response
                }
                
                await window.messagesWatcherEmit(
                  "messageNew",
                  formattedMessage
                );
              } else {
                await window.messagesWatcherEmit(
                  "messageNew",
                  formattedMessage
                );
              }
              break;
          }
        });
      }

      attachMessageListener();

      window.addEventListener("wsReconnected", () => {
        attachMessageListener();
      });

    }, instance.account.id);
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

  async sendMessage(memberId, message, attachments = [], charge = {}, _bag) {
    return this.page.evaluate(async (accessToken, memberId, message, attachments, charge, _bag, httpApiUrl) => {
      const requestBody = {
        attachments,
        randomId: -1,
        text: message,
        ...charge
      };

      // Mark this message as pending sent to avoid WebSocket duplication
      const messageId = window.markMessageAsPendingSent(message);

      fetch(httpApiUrl + '/im/' + memberId + '/send', {
        method: 'POST',
        headers: {
          'Authorization': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }).then(async (response) => {
        // Remove from pending when HTTP response arrives
        window.removeMessageFromPending(message, messageId);
        
        await window.messagesWatcherEmit("messageSent", {
          ...await window.formatMessage(await response.json()),
          memberId,
        }, _bag);
      });
    }, this.account.token, memberId, message, attachments, charge, _bag, HTTP_API_URL);
  }

  #checkPendingSentMessage(messageText) {
    const currentTime = Date.now();
    let foundMatch = false;

    for (const [messageKey, timestamp] of this.store.pendingSentMessages.entries()) {
      const [pendingText, messageId] = messageKey.split('|');

      if (pendingText === messageText && Math.abs(currentTime - timestamp) < 5000) {
        this.store.pendingSentMessages.delete(messageKey);
        foundMatch = true;
        break;
      }
    }

    return foundMatch;
  }

  #markMessageAsPendingSent(messageText) {
    const messageId = ++this.store.messageCounter;
    const messageKey = `${messageText}|${messageId}`;
    this.store.pendingSentMessages.set(messageKey, Date.now());

    // Clean up after timeout to prevent memory leaks
    setTimeout(() => {
      if (this.store.pendingSentMessages.has(messageKey)) {
        this.store.pendingSentMessages.delete(messageKey);
      }
    }, MESSAGE_DEDUP_TIMEOUT);

    return messageId;
  }

  #removeMessageFromPending(messageText, messageId) {
    const messageKey = `${messageText}|${messageId}`;
    this.store.pendingSentMessages.delete(messageKey);
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