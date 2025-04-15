import EventEmitter from "node:events";

class DialogsWatcher extends EventEmitter {

  page;
  cdpSession;

  dialogs = [];

  me = {
    externalId: null,
    id: null,
  };

  constructor(page, cdpSession) {
    super();
    this.page = page;
    this.cdpSession = cdpSession;
  }

  static async init(page, cdpSession) {
    const instance = new this(page, cdpSession);

    await instance.page.goto(`https://fancentro.com/admin/messages`, {waitUntil: 'networkidle0', timeout: 60000});

    // Wait for successful connection via WS and make it available globally.
    await this.createWsConnection(instance);

    return instance;
  }

  async requestRooms(limit = 50, offset = 0) {
    return this.page.evaluate(
      (limit, offset) => {
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

        fetch("https://fancentro.com/admin/api/chat.getInterlocutors", {
          method: "POST",
          body: formData,
        }).then(async (response) => {
          const usersData = (await response.json()).response.collection;
          for (const userExternalId in usersData) {
            window.addUserDataToRoom(userExternalId, usersData[userExternalId]);
          }
        });
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
      await instance.page.evaluate(() => {
        return new Promise((resolveBrowser) => {
          const ws = new WebSocket('wss://im.fancentro.com/socket.io/?EIO=4&transport=websocket');

          ws.onmessage = (event) => {
            const data = event.data;

            if (data.startsWith('0{"sid"')) {
              ws.send('40/fc');
            } else if (data.startsWith('40/fc,{"sid"')) {

              // @TODO VERY IMPORTANT TO FIX!!!
              ws.send('42/fc,' + JSON.stringify(["authentication", {
                authKey: "ccd8f6a04f835c2b0ba64ea1b2be5ac0",
                sessionHash: "af49373d_0cb91437"
              }]));
            } else if (data.startsWith('42/fc,["authenticated"')) {
              window.ws = ws; // Store WebSocket globally
              resolveBrowser(true); // Resolve promise on successful authentication

              // Start keep-alive messages
              setInterval(() => {
                ws.send("3");
              }, 20000);
            }
          };
        });
      });

      resolve();
    });

    await instance.page.exposeFunction("requestRooms", instance.requestRooms.bind(instance));
    await instance.page.exposeFunction("requestUsersData", instance.requestUsersData.bind(instance));
    await instance.page.exposeFunction("requestFeed", instance.requestFeed.bind(instance));
    await instance.page.exposeFunction("setMe", instance.setMe.bind(instance));
    await instance.page.exposeFunction("getMe", instance.getMe.bind(instance));
    await instance.page.exposeFunction("addRoom", instance.addRoom.bind(instance));
    await instance.page.exposeFunction("isAllRoomsCompletelyLoaded", instance.isAllRoomsCompletelyLoaded.bind(instance));
    await instance.page.exposeFunction("addUserDataToRoom", instance.addUserDataToRoom.bind(instance));
    await instance.page.exposeFunction("watcherEmit", instance.emit.bind(instance));
      await instance.page.evaluate(async () => {
      window.ws.addEventListener("message", async (event) => {
        const data = event.data;
        if (!data.includes("42/fc,")) return;
        const parsed = JSON.parse(data.replace("42/fc,", ""));

        switch (parsed[0]) {
          case 'room_list':
            if (parsed[1].roomsData.length === 0) {
              return;
            }

            // Match me.
            if (!(await window.getMe()).id || !(await window.getMe()).externalId) {
              const me = parsed[1].roomsData[0].members.find((member) => member.role === 'model').user;
              await window.setMe(me.id, me.external.id);
            }

            const membersWithoutInfo = [];
            for (const room of parsed[1].roomsData) {
              const result = await window.addRoom(room);
              if (!result.userData) {
                membersWithoutInfo.push(result.userExternalId);
              }
            }

            new Promise((resolve) => {
              const interval = setInterval(async () => {
                if (await window.isAllRoomsCompletelyLoaded()) {
                  resolve();
                  clearInterval(interval);
                }
              }, 1000);
            }).then(() => {
              window.watcherEmit("update");
            });

            await window.requestUsersData(membersWithoutInfo);
            await window.requestFeed();
            break;
          case 'feed_data':
            // @todo Implement feed.
            break;
        }
      });

      await window.requestRooms(50, 0);
    });

    return ws;
  }

  getDialogs() {
    return this.dialogs;
  }

  addUserDataToRoom(userExternalId, data) {
    const index = this.dialogs.findIndex(item => item.userExternalId === +userExternalId);
    return this.dialogs[index] = {...this.dialogs[index], userData: data};
  }

  setMe(id, externalId) {
    this.me.id = id;
    this.me.externalId = externalId;
  }

  getMe() {
    return this.me;
  }

  addFeedToRoom(userId, count) {
    const index = this.dialogs.findIndex(item => item.userId === userId);
    return this.dialogs[index] = {...this.dialogs[index], feed: count};
  }

  isAllRoomsCompletelyLoaded() {
    return !this.dialogs.find((item) => item.room === null || item.feed === null || item.userData === null);
  }

  addRoom(data) {
    const member = data.members.find(m => +m.externalId !== this.me.externalId);
    const targetUserExternalId = +member?.externalId || null;
    const targetUserId = member?.user.id || null;

    const index = this.dialogs.findIndex(item => item.userExternalId === targetUserExternalId);
    let result;

    if (index === -1) {
      result = {userExternalId: targetUserExternalId, userId: targetUserId, room: data, userData: null, feed: 0}; // @todo Replace feed 0 with null and implement 0 assignment in ws feed message.
      this.dialogs.push(result);
    } else {
      result = {...this.dialogs[index], room: data};
      this.dialogs[index] = result;
    }

    return result;
  }

}

export default DialogsWatcher;
