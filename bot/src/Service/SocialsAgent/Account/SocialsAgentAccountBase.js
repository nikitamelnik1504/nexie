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

  setPlatformParams(params) {
    this.platformSettings.params = params;
  }

  async getClient() {
    switch (this.clientSettings.type) {
      case 'dolphin':
        try {
          return await this.service.getDolphinService().connect(this.clientSettings.params.apiUrl, this.clientSettings.params.authToken);
        } catch (error) {
          return false;
        }
    }
  }

  async getClientConnectionStatus() {
    return !!(await this.getClient());
  }

  async getPlatformConnectionStatus() {
    return this.getClientConnectionStatus();
  }

  async startPlatformConnection() {
    switch (this.clientSettings.type) {
      case 'dolphin':
        ((await this.getClient()).profile(this.clientSettings.params.profile)).start();
        return true;
    }
  }

}

export default SocialsAgentAccountBase;