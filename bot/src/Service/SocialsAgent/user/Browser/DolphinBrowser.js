import PuppeteerBrowserBase from "../../lib/PuppeteerBrowserBase.js";

class DolphinBrowser extends PuppeteerBrowserBase {

  authToken;
  apiUrl;
  profile;

  constructor(props, apiUrl, authToken, profile) {
    super(props);
    this.authToken = authToken;
    this.apiUrl = apiUrl;
    this.profile = profile;
  }

  async start() {
    if (this.client && this.wsConnection) {
      throw new Error('Dolphin browser is already running!');
    }

    this.client = await this._clientManager.get('dolphin', {
      authToken: this.authToken,
      apiUrl: this.apiUrl,
    });

    const clientProfile = await this.client.profile(this.profile);

    if (!clientProfile) {
      throw new Error('Dolphin profile is not found.');
    }

    await clientProfile.start();

    if (clientProfile.running === false) {
      // throw new Error(AccountBase.CLIENT_BROWSER_STATUS[this.clientBrowserStatus = 1]);
    } else if (clientProfile.running === true && clientProfile.wsEndpoint === null) {
      // throw new Error(AccountBase.CLIENT_BROWSER_STATUS[this.clientBrowserStatus = 2]);
    }

    this.wsConnection = await clientProfile.getBrowser();
  }

  async stop() {
    await super.stop();

    if (!this.client || !this.wsConnection) {
      throw new Error('Dolphin browser is not running!');
    }

    this.wsConnection = null;
    await (await this.client.profile(this.profile)).stop();
  }

}

export default DolphinBrowser;