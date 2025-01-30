import EventEmitter from 'node:events';
import MessagesEmitter from "./MessagesEmitter.js";

class DolphinFancentroTab {

  dialogsEmitter = null;

  dialogMessagesEmitter;

  browser;

  profile;

  accountId = null;

  constructor(profile, browser) {
    this.profile = profile;
    this.browser = browser;
  }

  static async open(profile, browser) {
    const instance = new this(profile, browser);

    // try {
    //   const cookies = await instance.profile.exportCookies();
    //   await instance.page.setCookie(...cookies);
    // } catch (error) {
    //   console.error(error);
    // }

    return instance;
  }

  async getAccountUserId() {
    if (this.accountId !== null) {
      return this.accountId;
    }

    // Open empty page and import cookies.
    const page = await this.browser.newPage();
    try {
      const cookies = await this.profile.exportCookies();
      await page.setCookie(...cookies);
    } catch (error) {
      console.error(error);
    }

    const devtoolsSession = await page.target().createCDPSession();
    await devtoolsSession.send('Network.enable');

    const accountId = await (new Promise(resolve => {
      devtoolsSession.on('Network.webSocketFrameReceived', async ({requestId, timestamp, response}) => {
        if (!response.payloadData.includes('room')) {
          return;
        }

        const data = await JSON.parse(response.payloadData.replace(/^42\/fc,/, ''));
        if (data[0] !== 'room_list') {
          return;
        }

        resolve(data[1].currentUserId);
      });

      page.goto('https://fancentro.com/admin/messages');
    }));

    await page.close();

    return this.accountId = accountId;
  }

  async getAuthorizationStatus(username, login = null, password = null) {
    const page = await this.browser.newPage();
    await page.setViewport({width: 414, height: 896});

    await page.goto(`https://fancentro.com/login`, {waitUntil: 'networkidle0', timeout: 60000});

    try {
      if (!(await page.waitForSelector('button[data-testid="navigation-top-user-menu-mobile"]', {timeout: 15000}))) {
        page.close();
        return 0;
      } else {
        await page.click('button[data-testid="navigation-top-user-menu-mobile"]');
        await page.waitForSelector('button[data-testid="navigation-top-user-menu-mobile-close"]', {timeout: 15000});
        const accountAgency = await page.$('span[data-i18alias="agency"]');

        const accountUsername = await page.evaluate(el => {
          let accountInfoWrapper = el.parentElement.parentElement;
          return accountInfoWrapper.querySelector('span').innerText;
        }, accountAgency);

        if (accountUsername !== username) {
          page.close();
          return 2;
        }

        page.close();
        return 1;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getDialogsLive() {
    if (this.dialogsEmitter !== null) {
      return this.dialogsEmitter;
    }

    // Open empty page and import cookies.
    const page = await this.browser.newPage();
    try {
      const cookies = await this.profile.exportCookies();
      await page.setCookie(...cookies);
    } catch (error) {
      console.error(error);
    }

    // Open devtools to handle websockets in the future.
    const devtoolsSession = await page.target().createCDPSession();
    await devtoolsSession.send('Network.enable');

    class DialogsEmitter extends EventEmitter {
      data = {
        users: {},
        dialogs: []
      };
    }

    const dialogsEmitter = new DialogsEmitter();

    // Get chat preview message and target user profile id.
    await devtoolsSession.on('Network.webSocketFrameReceived', async ({requestId, timestamp, response}) => {
      if (!response.payloadData.includes('room')) {
        return;
      }
      const data = await JSON.parse(response.payloadData.replace(/^42\/fc,/, ''));
      if (data[0] !== 'room_list' || data[1].roomsData.length === 0) {
        return;
      }

      // Reset previously saved dialogs.
      dialogsEmitter.data.dialogs.length = 0;

      const currentUserId = data[1].currentUserId;
      const rooms = data[1].roomsData;

      // If profile data any of dialogs is not loaded - don't emit whole dialogs.
      let usersDataLoaded = true;
      for (const room of rooms) {
        const targetUser = room.members.find(member => member.user.id !== currentUserId);

        dialogsEmitter.data.dialogs.push({
          id: room._id,
          timestamp: room.messages[0] !== null ? room.messages[0].timestamp : null,
          userId: targetUser.user.id,
          userExternalId: targetUser.user.external.id.toString(),
          message: {
            from: room.messages[0] !== null ? room.messages[0].authorId : null,
            body: room.messages[0] !== null ? room.messages[0].data : null,
          }
        })

        if (!dialogsEmitter.data.users[targetUser.user.external.id]) {
          usersDataLoaded = false;
        }
      }

      if (!usersDataLoaded) {
        return;
      }

      const result = [];
      for (const dialog of dialogsEmitter.data.dialogs) {
        result.push({
          ...dialog,
          ...dialogsEmitter.data.users[dialog.userExternalId],
        })
      }

      dialogsEmitter.emit('list', result);
    });

    // Get target user profile data. Username, picture...
    page.on('response', async (response) => {
      if (!response.url().includes('chat.getInterlocutors')) {
        return;
      }

      // Reset previously saved users.
      dialogsEmitter.data.users = {};

      try {
        const responseBody = await response.text();
        const data = JSON.parse(responseBody);
        if (data.response.meta.total === 0) {
          return;
        }

        const users = data.response.collection;

        let messagesDataLoaded = true;
        for (const userId in users) {
          dialogsEmitter.data.users[userId.toString()] = {
            avatar: users[userId.toString()].avatar,
            userName: users[userId.toString()].name,
            originUserName: users[userId.toString()].originName
          };

          if (!dialogsEmitter.data.dialogs.find(dialog => dialog.userExternalId === userId.toString())) {
            messagesDataLoaded = false;
          }
        }

        if (!messagesDataLoaded) {
          return;
        }

        const result = [];
        for (const dialog of dialogsEmitter.data.dialogs) {
          result.push({
            ...dialog,
            ...dialogsEmitter.data.users[dialog.userExternalId],
          })
        }

        dialogsEmitter.emit('list', result);
      } catch (error) {
        console.log(error);
      }
    });

    dialogsEmitter.on('refresh', async () => {
      await page.goto(`https://fancentro.com/admin/messages`, {waitUntil: 'networkidle0'});
    });

    await page.goto(`https://fancentro.com/admin/messages`, {waitUntil: 'networkidle0'});

    return this.dialogsEmitter = dialogsEmitter;
  }

  async getDialogMessagesLive() {
    if (this.dialogMessagesEmitter) {
      return this.dialogMessagesEmitter;
    }

    // Open an empty page and import cookies.
    const page = await this.browser.newPage();
    try {
      const cookies = await this.profile.exportCookies();
      await page.setCookie(...cookies);
    } catch (error) {
      console.error('Error importing cookies:', error);
    }

    // Open devtools to handle WebSockets in the future.
    const devtoolsSession = await page.target().createCDPSession();
    await devtoolsSession.send('Network.enable');

    const messagesEmitter = new MessagesEmitter(devtoolsSession);

    await page.goto(`https://fancentro.com/admin/messages`, { waitUntil: 'networkidle0'});

    return this.dialogMessagesEmitter = messagesEmitter;
  }

}

export default DolphinFancentroTab;