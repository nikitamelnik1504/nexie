class SocialsAgentAccountBase {

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
        return await this.service.getDolphinService().connect(this.clientSettings.params.apiUrl, this.clientSettings.params.authToken);
    }
  }

  async getClientConnectionStatus() {
    try {
      return !!(await this.getClient());
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async getPlatformConnectionStatus() {
    return this.getClientConnectionStatus();
  }

  async startPlatformConnection() {
    switch (this.clientSettings.type) {
      case 'dolphin':
        await (await (await this.getClient()).profile(this.clientSettings.params.profile)).start();
        return true;
    }
  }

}

export default SocialsAgentAccountBase;