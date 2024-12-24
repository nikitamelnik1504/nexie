class DolphinTonTab {

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

    await page.goto(`https://ton.place/`, {waitUntil: 'networkidle0', timeout: 60000});
    console.log(page);

    try {
      if ((await page.$('a[href="/dashboard"]', {timeout: 3000}) !== null)) {
        return 0;
      } else {

        await page.click('a.UnitPhoto');
        await page.waitForSelector('div.Profile__common_info__cont');
        const accountUsername = await page.$eval('div.Profile__common_info__cont h1.Profile__common_info__name', (el) => el.textContent.trim());

        if (accountUsername.replace(' ', '_') !== username) {
          return 2;
        }

        return 1;
      }
    } catch (error) {
      console.log(error);
    }
  }

}

export default DolphinTonTab;