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
  }

  addMessages(data) {
    this.messages = data;
  }

  getMessages() {
    return this.messages;
  }

}

export default MessagesWatcher;