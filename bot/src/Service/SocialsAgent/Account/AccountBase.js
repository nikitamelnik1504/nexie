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
  static CLIENT_CONNECTION_STATUS = {
    0: 'Profile is not found',
    1: 'Profile is failed to start',
    2: 'Profile is running out of bot',
    3: 'Profile is successfully started'
  };

  clientConnection;

  clientConnectionStatus = null;
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
        return await this.service.getClientServices().dolphin.client(this.clientSettings.params.apiUrl, this.clientSettings.params.authToken);
    }
  }

  async getClientConnectionStatus() {
    return this.clientConnectionStatus;
  }

  async getPlatformConnectionStatus() {
    return this.platformConnectionStatus;
  }

  async getPlatformMessenger() {
    return this.messenger;
  }

  async startClientConnection() {
    switch (this.clientSettings.type) {
      case 'dolphin':
        const dolphinProfile = await (await this.getClient()).profile(this.clientSettings.params.profile);

        if (!dolphinProfile) {
          this.clientConnectionStatus = 0;
          throw new Error(AccountBase.CLIENT_CONNECTION_STATUS[this.clientConnectionStatus]);
        }

        await dolphinProfile.start()

        if (dolphinProfile.running === false) {
          throw new Error(AccountBase.CLIENT_CONNECTION_STATUS[this.clientConnectionStatus = 1]);
        } else if (dolphinProfile.running === true && dolphinProfile.wsEndpoint === null) {
          throw new Error(AccountBase.CLIENT_CONNECTION_STATUS[this.clientConnectionStatus = 2]);
        }

        this.clientConnection = await dolphinProfile.openBrowser()
        this.clientConnectionStatus = 3;

        break;
    }
  }

  async stopClientConnection() {
    if (this.clientConnection.isAnyTabOpen()) {
      this.clientConnection = null;
      this.clientConnectionStatus = null;
      return;
    }

    switch (this.clientSettings.type) {
      case 'dolphin':
        const dolphinProfile = await (await this.getClient()).profile(this.clientSettings.params.profile);
        dolphinProfile.closeBrowser();
        await dolphinProfile.stop();
        break;
    }

    this.clientConnection = null;
    this.clientConnectionStatus = null;
  }

  async startPlatformConnection() {
    await this.clientConnection.openTab(this.platformSettings.name);
  }

  async stopPlatformConnection() {
    await this.clientConnection.closeTab(this.platformSettings.name);
  }

}

export default AccountBase;