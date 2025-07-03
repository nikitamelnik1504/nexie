import puppeteer from "puppeteer-core";

class SystemProfile {

  running = false;

  port = '';
  wsEndpoint = '/devtools/browser/<unique_id>';

  _client;

  browser = null;

  constructor(systemClient) {
    this._client = systemClient;
  }

  async start() {
    this.running = true;
    return this;
  }

  async stop() {
    if (!this.running) return this;

    try {
      // @todo Replace this shit.
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.running = false;

        // Delay after close.
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

    } catch (error) {
      console.log(error);
    }

    return this;
  }

  async refresh() {
    if (this.running === true) {
      return this;
    }

    this.running = false;

    await this.start();

    if (this.running === true) {
      return this;
    }

    await this.stop();

    return this;
  }

  async getBrowser() {
    if (this.running === false) {
      throw new Error('Profile is not running!');
    }

    if (this.browser !== null) {
      return this.browser;
    }

    //   const cookies = await instance.profile.exportCookies();
    //   await instance.page.setCookie(...cookies);
    return this.browser = await puppeteer.connect({
      browserWSEndpoint: `ws://127.0.0.1:${this.port}${this.wsEndpoint}`,
    })
  }

}

export default SystemProfile;