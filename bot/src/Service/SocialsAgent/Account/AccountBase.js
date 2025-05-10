import FancentroMessenger from "../Platform/Fancentro/Messenger.js";
import TonMessenger from "../Platform/Ton/Messenger.js";

class AccountBase {

  id;

  clientSettings = {
    type: null,
    params: {},
  };

  platformSettings = {
    name: null,
    login: null,
    password: null,
    username: null
  };

  // @todo Implement dolphin client hierarchy.
  static CLIENT_BROWSER_STATUS = {
    0: 'Profile is not found',
    1: 'Profile is failed to start',
    2: 'Profile is running out of bot',
    3: 'Profile is successfully started'
  };

  static PLATFORM_CONNECTION_STATUS = {
    0: 'Account is not authorized',
    1: 'Account is authorized',
  }

  clientBrowser;

  clientBrowserStatus = null;
  platformConnectionStatus = null;

  messenger = null;

  service;

  constructor(id, service, clientType, clientParams, platformName, platformAccountLogin = null, platformAccountPassword = null, platformAccountUsername = null) {
    this.id = id;
    this.service = service;
    this.clientSettings.type = clientType;
    this.clientSettings.params = clientParams;
    this.platformSettings.name = platformName;
    this.platformSettings.login = platformAccountLogin;
    this.platformSettings.password = platformAccountPassword;
    this.platformSettings.username = platformAccountUsername;
  }

  getClientType() {
    return this.clientSettings.type;
  }

  getPlatformType() {
    return this.platformSettings.name;
  }

  getPlatformLogin() {
    return this.platformSettings.login;
  }

  setPlatformLogin(login) {
    this.platformSettings.login = login;
  }

  getPlatformPassword() {
    return this.platformSettings.password;
  }

  setPlatformPassword(password) {
    this.platformSettings.password = password;
  }

  getPlatformUsername() {
    return this.platformSettings.username;
  }

  setPlatformUsername(username) {
    this.platformSettings.username = username;
  }

  setClientParams(params) {
    this.clientSettings.params = params;
  }

  getClientParams() {
    return this.clientSettings.params;
  }

  toJSON() {
    return {
      id: this.id,
      client: {
        type: this.clientSettings.type,
        params: this.clientSettings.params,
      },
      platform: this.platformSettings,
    }
  }

  async getClient() {
    switch (this.clientSettings.type) {
      case 'dolphin':
        return await this.service.getClientManager().getDolphinClient(this.clientSettings.params.apiUrl, this.clientSettings.params.authToken);
    }
  }

  async getClientBrowserStatus() {
    return this.clientBrowserStatus;
  }

  async getPlatformConnectionStatus() {
    return this.platformConnectionStatus;
  }

  async getPlatformMessenger() {
    return this.messenger;
  }

  async startClientBrowser() {
    switch (this.clientSettings.type) {
      case 'dolphin':
        const dolphinProfile = await (await this.getClient()).profile(this.clientSettings.params.profile);

        if (!dolphinProfile) {
          this.clientBrowserStatus = 0;
          throw new Error(AccountBase.CLIENT_BROWSER_STATUS[this.clientBrowserStatus]);
        }

        await dolphinProfile.start();

        if (dolphinProfile.running === false) {
          throw new Error(AccountBase.CLIENT_BROWSER_STATUS[this.clientBrowserStatus = 1]);
        } else if (dolphinProfile.running === true && dolphinProfile.wsEndpoint === null) {
          throw new Error(AccountBase.CLIENT_BROWSER_STATUS[this.clientBrowserStatus = 2]);
        }

        this.clientBrowser = await dolphinProfile.openBrowser();
        this.clientBrowserStatus = 3;

        break;
    }
  }

  async stopClientBrowser() {
    if (this.clientBrowser.isAnyDaemonRunning()) {
      this.clientBrowser = null;
      this.clientBrowserStatus = null;
      return;
    }

    switch (this.clientSettings.type) {
      case 'dolphin':
        const dolphinProfile = await (await this.getClient()).profile(this.clientSettings.params.profile);
        dolphinProfile.closeBrowser();
        await dolphinProfile.stop();
        break;
    }

    this.clientBrowser = null;
    this.clientBrowserStatus = null;
  }

  async startPlatformConnection() {
    await this.startClientBrowser();

    const clientBrowserDaemon = await this.clientBrowser.launchDaemon(this.platformSettings.name, this.platformSettings.username);

    if (clientBrowserDaemon.watchers.dialogs === null) {
      this.platformConnectionStatus = 0;
      return;
    }

    switch (this.platformSettings.name) {
      case 'fancentro':
        this.messenger = await FancentroMessenger.init(clientBrowserDaemon);
        break;
      case 'ton':
        this.messenger = await TonMessenger.init(clientBrowserDaemon);
        break;
    }

    this.platformConnectionStatus = 1;
  }

  async stopPlatformConnection() {
    await this.clientBrowser.stopDaemon(this.platformSettings.name);
    await this.stopClientBrowser();
    // @todo Do messenger related things.
    this.messenger = null;
    this.platformConnectionStatus = null;
  }

}

export default AccountBase;