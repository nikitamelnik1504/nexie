class DolphinFancentroTab {

  page;
  profile;

  constructor(profile, page) {
    this.profile = profile;
    this.page = page;
  }

  static async open(profile, page) {
    const instance = new this(profile, page);

    await instance.page.setViewport({width: 414, height: 896});

    try {
      const cookies = await instance.profile.exportCookies();
      await instance.page.setCookie(...cookies);
    } catch (error) {
      console.error(error);
    }

    await instance.page.goto('https://fancentro.com');
    return instance;
  }

  async getAuthorizationStatus(username, login = null, password = null) {
    // @todo Bug with missing page.
    await this.page.goto(`https://fancentro.com/login`, {waitUntil: 'networkidle0', timeout: 60000});

    try {
      if (!(await this.page.waitForSelector('button[data-testid="navigation-top-user-menu-mobile"]', {timeout: 15000}))) {
        return 0;
      } else {
        await this.page.click('button[data-testid="navigation-top-user-menu-mobile"]');
        await this.page.waitForSelector('button[data-testid="navigation-top-user-menu-mobile-close"]', {timeout: 15000});
        const accountAgency = await this.page.$('span[data-i18alias="agency"]');

        const accountUsername = await this.page.evaluate(el => {
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

}

export default DolphinFancentroTab;