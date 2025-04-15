import EventEmitter from "node:events";

class MessagesWatcher extends EventEmitter {

  page;
  cdpSession;

  messages = [];

  constructor(page, cdpSession) {
    super();
    this.page = page;
    this.cdpSession = cdpSession;
  }

  static async init(page, cdpSession) {
    const instance = new this(page, cdpSession);

    await this.extendWsConnection(instance);

    return instance;
  }

  static async extendWsConnection(instance) {
    await instance.page.exposeFunction("addMessages", instance.addMessages.bind(instance));
    await instance.page.exposeFunction("addMessage", instance.addMessage.bind(instance));
    await instance.page.exposeFunction("messagesWatcherEmit", instance.emit.bind(instance));
    await instance.page.evaluate(async () => {
      const message_event = async (event) => {
        const data = event.data;
        if (!data.includes("42/fc,")) return;
        const parsed = JSON.parse(data.replace("42/fc,", ""));

        switch (parsed[0]) {
          // @todo Implement buckets system.
          case 'room_buckets':
            await window.addMessages(parsed[1].buckets[0]);
            window.messagesWatcherEmit("update");
            break;
          case 'message':
            await window.addMessage(parsed[1]);
            window.messagesWatcherEmit("new", parsed[1].id);
            break;
        }
      };

      window.ws.addEventListener("message", message_event);
    });

    instance.on("loadMessages", async (dialogId) => {
      await instance.page.evaluate(async (dialogId) => {
        window.ws.send('42/fc,' + JSON.stringify(["room_buckets", {
          minCount: 50,
          position: "firstUnread",
          roomId: dialogId,
          withNextBuckets: false
        }]));
      }, dialogId);
    });

    instance.on("sendMessage", async (dialogId, message) => {
      await instance.page.evaluate(async (dialogId, message) => {
        window.ws.send('42/fc,' + JSON.stringify(["message", {
          additionalData: {recipientGroup: "followers"},
          data: {text: message},
          edited: 0,
          isBulk: false,
          muted: false,
          price: null,
          reactions: [],
          room: dialogId,
          state: 2,
          type: "text"
        }]));
      }, dialogId, message);
    })
  }

  addMessages(data) {
    this.messages = data;
  }

  addMessage(data) {
    this.messages.push(data);
  }

  getMessages() {
    return this.messages;
  }

  getMessage(id) {
    return this.messages.find(message => message.id === id);
  }

}

export default MessagesWatcher;