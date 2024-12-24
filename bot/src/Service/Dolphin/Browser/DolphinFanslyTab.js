import {timeout} from "puppeteer";

class DolphinFanslyTab {

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

    await page.goto(`https://fansly.com/`, {waitUntil: 'networkidle0', timeout: 60000});
    console.log(page);

    try {
      if ((await page.$('a[href="/home"]', {timeout: 3000}) !== null)) {
        return 0;
      } else {
        const profileLink = await page.$eval('div.user-account a', (el) => el.getAttribute('href'));
        await page.goto(`https://fansly.com` + profileLink, {waitUntil: 'networkidle0', timeout: 60000});
        const usernameElement = await page.waitForSelector('app-account-username.user-name span.user-name', { timeout: 15000 });
        const accountUsername = await usernameElement.evaluate(el => el.textContent.replace('@', '').trim());

        if (accountUsername !== username) {
          return 2;
        }

        return 1;
      }
    } catch (error) {
      console.log(error);
    }
  }
}

export default DolphinFanslyTab;