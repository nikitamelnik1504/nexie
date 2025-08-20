import FancentroMessenger from "../src/Messenger/Fancentro/Messenger.js";
import TonMessenger from "../src/Messenger/Ton/Messenger.js";

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

  async getMessenger() {
    return this.messenger;
  }

  async startMessenger() {
    switch (this.platformSettings.name) {
      case 'fancentro':
        this.messenger = await (new FancentroMessenger(this.service.getClientManager(), this.service.getBrowserManager(), this.clientSettings, this.platformSettings)).start();
        break;
      case 'ton':
        this.messenger = await (new TonMessenger(this.service.getClientManager(), this.service.getBrowserManager(), this.clientSettings, this.platformSettings)).start();
        break;
    }
  }

  async stopMessenger() {
    await this.messenger.stop();
    // @todo Do messenger related things.
    this.messenger = null;
  }

}

export default AccountBase;