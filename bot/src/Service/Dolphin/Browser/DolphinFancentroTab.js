import EventEmitter from 'node:events';

class DolphinFancentroTab {

  dialogsEmitter = null;
  messagesWebSocket = null;
  browser;
  profile;

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

  async getAuthorizationStatus(username, login = null, password = null) {
    const page = await this.browser.newPage();
    await page.setViewport({width: 414, height: 896});

    await page.goto(`https://fancentro.com/login`, {waitUntil: 'networkidle0', timeout: 60000});

    try {
      if (!(await page.waitForSelector('button[data-testid="navigation-top-user-menu-mobile"]', {timeout: 15000}))) {
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
          return 2;
        }

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

      const dialogs = [];
      const rooms = data[1].roomsData;
      const currentUserId = data[1].currentUserId;

      for (const room of rooms) {
        const targetUser = room.members.find(member => member.user.id !== currentUserId);

        dialogs.push({
          id: room._id,
          timestamp: room.messages[0] !== null ? room.messages[0].timestamp : null,
          userId: targetUser.user.id,
          userExternalId: targetUser.user.external.id,
          message: {
            from: room.messages[0] !== null ? room.messages[0].authorId: null,
            body: room.messages[0] !== null ? room.messages[0].data : null,
          }
        })
      }

      dialogsEmitter.emit('messages_data', dialogs);
    });

    // Get target user profile data. Username, picture...
    page.on('response', async (response) => {
      if (!response.url().includes('chat.getInterlocutors')) {
        return;
      }

      try {
        const responseBody = await response.text();
        const data = JSON.parse(responseBody);
        if (data.response.meta.total === 0) {
          return;
        }
        dialogsEmitter.emit('users_data', data.response.collection);
      } catch (error) {
        console.log(error);
      }
    });

    this.dialogsEmitter = dialogsEmitter;

    await page.goto(`https://fancentro.com/admin/messages`, {waitUntil: 'networkidle0'});

    return this.dialogsEmitter;
  }

}

export default DolphinFancentroTab;