import EventEmitter from "node:events";

class DialogsWatcher extends EventEmitter {

  account;

  page;

  me = {
    externalId: null,
    id: null,
  };

  constructor(page, account) {
    super();
    this.page = page;
    this.account = account;
  }

  static async init(page, account) {
    const instance = new this(page, account);

    // Wait for successful connection via WS and make it available globally.
    await this.createWsConnection(instance);

    return instance;
  }

  async requestDialogs(limit = 50, offset = 0) {
    return this.page.evaluate(
      (limit, offset) => {
        const eventListener = async (event) => {
          const data = event.data;
          if (!data.includes("42/fc,")) return;
          const parsed = JSON.parse(data.replace("42/fc,", ""));

          if (parsed[0] !== 'room_list') {
            return;
          }

          if (parsed[1].roomsData.length === 0) {
            return;
          }

          const result = [];
          const membersWithoutInfo = [];

          for (const roomData of parsed[1].roomsData) {
            const room = await window.formatRoom(roomData);
            result.push(room);
            membersWithoutInfo.push(room.memberData.externalId);
          }

          await window.requestUsersData(membersWithoutInfo).then(async (response) => {
            const usersData = await response.response.collection;

            for (const userExternalId in usersData) {
              const index = result.findIndex(item => item.memberData.externalId === +userExternalId);
              result[index].memberData = {...result[index].memberData, ...usersData[userExternalId]};
            }
          });

          await window.requestFeed();

          await window.dialogsWatcherEmit("dialogsList", { nextFrom: offset + limit, list: result });

          window.ws.removeEventListener("message", eventListener);
        }

        window.ws.addEventListener("message", eventListener);

        window.ws.send(
          "42/fc," +
          JSON.stringify([
            "get_rooms",
            {
              limit,
              offset,
            },
          ])
        );
      },
      limit,
      offset
    );
  }

  async requestUsersData(userIds = []) {
    return this.page.evaluate(
      async (userIds) => {
        const formData = new FormData();

        let i = 0;
        for (const userId of userIds) {
          formData.append("userIds" + `[${i}]`, userId);
          i++;
        }

        return fetch("https://fancentro.com/admin/api/chat.getInterlocutors", {
          method: "POST",
          body: formData,
        }).then(response => response.json());
      },
      userIds
    );
  }

  async requestFeed() {
    return this.page.evaluate(
      () => {
        window.ws.send(
          "42/fc," +
          JSON.stringify(["get_feed"])
        );
      },
    );
  }

  static async createWsConnection(instance) {
    const ws = await new Promise(async (resolve) => {
      await instance.page.evaluate((authKey, sessionHash) => {
        return new Promise((resolveBrowser) => {
          const ws = new WebSocket('wss://im.fancentro.com/socket.io/?EIO=4&transport=websocket');

          ws.addEventListener("message", (event) => {
            const data = event.data;

            if (data.startsWith('0{"sid"')) {
              ws.send('40/fc');
            } else if (data.startsWith('40/fc,{"sid"')) {

              ws.send('42/fc,' + JSON.stringify(["authentication", {
                authKey,
                sessionHash
              }]));
            } else if (data.startsWith('42/fc,["authenticated"')) {
              window.ws = ws; // Store WebSocket globally
              resolveBrowser(true); // Resolve promise on successful authentication

              // Start keep-alive messages
              setInterval(() => {
                ws.send("3");
              }, 20000);
            } else if (data === "2") {
              ws.send("3");
            }
          });
        });
      }, instance.account.authKey, instance.account.sessionHash);

      resolve();
    });

    await instance.page.exposeFunction("requestUsersData", instance.requestUsersData.bind(instance));
    await instance.page.exposeFunction("requestFeed", instance.requestFeed.bind(instance));
    await instance.page.exposeFunction("formatRoom", instance.formatRoom.bind(instance));
    await instance.page.exposeFunction("dialogsWatcherEmit", instance.emit.bind(instance));
    await instance.page.evaluate(async () => {
      window.ws.addEventListener("message", async (event) => {
        const data = event.data;
        if (!data.includes("42/fc,")) return;
        const parsed = JSON.parse(data.replace("42/fc,", ""));

        switch (parsed[0]) {
          case 'feed_data':
            // @todo Implement feed.
            break;
        }
      });
    });

    return ws;
  }

  getAccount() {
    return this.account;
  }

  addFeedToRoom(userId, count) {
    const index = this.dialogs.findIndex(item => item.userId === userId);
    return this.dialogs[index] = {...this.dialogs[index], feed: count};
  }

  formatRoom(data) {
    // @todo Replace feed 0 with null and implement 0 assignment in ws feed message.
    const result = {room: data, memberData: {
        externalId: null,
        id: null,
      }, feed: 0};

    const member = data.members.find(m => +m.externalId !== this.account.externalId);
    const targetUserExternalId = +member?.externalId || null;
    const targetUserId = member?.user.id || null;

    result.memberData.externalId = targetUserExternalId;
    result.memberData.id = targetUserId;

    for (const message of result.room.messages) {
      if (message === null) {
        continue;
      }

      if (message.data.text) {
        message.data.text = decodeURIComponent(message.data.text);
      }
    }

    return result;
  }

}

export default DialogsWatcher;
