import EventEmitter from "node:events";

class MessagesWatcher extends EventEmitter {

  page;
  cdpSession;

  room = {};

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
    await instance.page.exposeFunction("setRoom", instance.setRoom.bind(instance));
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
            await window.setRoom(parsed[1].buckets[0]);
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

  setRoom(data) {
    this.room = data;
  }

  addMessage(data) {
    this.room.messages.push(data);
  }

  getRoom() {
    return this.room;
  }

  getMessage(id) {
    return this.room.messages.find(message => message.id === id);
  }

}

export default MessagesWatcher;