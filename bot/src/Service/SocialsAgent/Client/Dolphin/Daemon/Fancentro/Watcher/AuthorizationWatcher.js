import EventEmitter from "node:events";

class AuthorizationWatcher extends EventEmitter {

  page;
  cdpSession;

  username = null;

  status = null;

  constructor(page, cdpSession) {
    super();

    this.page = page;
    this.cdpSession = cdpSession;
  }

  static async init(page, cdpSession) {
    const instance = new this(page, cdpSession);

    instance.page.on("load", async () => {
      try {
        await instance.page.waitForSelector('button[data-testid="navigation-top-user-menu-mobile"]', { timeout: 10000 });
        await instance.page.click('button[data-testid="navigation-top-user-menu-mobile"]');
        const accountAgency = await instance.page.$('span[data-i18alias="showWhenOnline"]');

        instance.username = await instance.page.evaluate(el => {
          let accountInfoWrapper = el.parentElement.parentElement.parentElement.parentElement;
          return accountInfoWrapper.querySelector('span').innerText;
        }, accountAgency);

        // await instance.page.click('button[data-testid="navigation-top-user-menu-mobile-close"]');
      } catch (error) {
        console.log(error);
        instance.username = false;
      }
    });

    return instance;
  }

  async getStatus(username) {
    if (this.username === username) {
      return 1;
    } else if (this.username !== username && this.username !== false) {
      return 2;
    } else if (this.username === false) {
      return 0;
    }
  }

}

export default AuthorizationWatcher;