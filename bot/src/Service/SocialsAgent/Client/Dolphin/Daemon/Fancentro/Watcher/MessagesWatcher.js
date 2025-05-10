import EventEmitter from "node:events";

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

    return instance;
  }

  static async extendWsConnection(instance) {
    await instance.page.exposeFunction("messagesWatcherEmit", instance.emit.bind(instance));

    await instance.page.evaluate(async () => {
      const message_event = async (event) => {
        const data = event.data;
        if (!data.includes("42/fc,")) return;
        const parsed = JSON.parse(data.replace("42/fc,", ""));

        switch (parsed[0]) {
          case 'message':
            // await window.addMessage(parsed[1]);
            // window.messagesWatcherEmit("new", parsed[1].id);
            break;
        }
      };

      window.ws.addEventListener("message", message_event);
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

  requestMessages(dialogId, bucketId) {
    return this.page.evaluate(async (dialogId, bucketId) => {
      const listener = async (event) => {
        const data = event.data;
        if (!data.includes("42/fc,")) return;
        const parsed = JSON.parse(data.replace("42/fc,", ""));

        if (parsed[0] !== 'room_buckets') {
          return;
        }

        const messages = [];
        for (const bucket of parsed[1].buckets) {
          for (const message of bucket.messages) {
            messages.push(message)
          }
        }

        window.ws.removeEventListener("message", listener);

        await window.messagesWatcherEmit("messagesList", {
          list: messages,
          dialogId,
          bucketId: parsed[1].buckets[0] ? parsed[1].buckets[0]._id : '',
        });
      }

      window.ws.addEventListener("message", listener);

      window.ws.send('42/fc,' + JSON.stringify(["room_buckets", {
        bucketId,
        direction: "top",
        roomId: dialogId,
        minCount: 50,
        withNextBuckets: false
      }]));
    }, dialogId, bucketId);
  }

}

export default MessagesWatcher;