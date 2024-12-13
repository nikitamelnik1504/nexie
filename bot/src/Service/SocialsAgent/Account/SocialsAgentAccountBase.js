class SocialsAgentAccountBase {

  id;

  clientSettings;
  platformSettings;

  service;

  constructor(service, data) {
    this.service = service;
    this.clientSettings = data.client;
    this.platformSettings = data.platform;
    this.id = data.id;
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

  getPlatformPassword() {
    return this.platformSettings.password;
  }

  async getClientConnectionStatus() {
    switch (this.clientSettings.type) {
      case 'dolphin':
        try {
          await this.service.getDolphinService().connect(this.clientSettings.apiUrl, this.clientSettings.authToken);
          return true;
        } catch (error) {
          return false;
        }
    }
  }

  async getPlatformConnectionStatus() {
    return this.getClientConnectionStatus();
  }

  async startPlatformConnection() {
    switch (this.clientSettings.type) {
      case 'dolphin':
        (await (await this.service.getDolphinService().connect(this.clientSettings.apiUrl, this.clientSettings.authToken)).profile(this.clientSettings.profile)).start();
        return true;
    }
  }

}

export default SocialsAgentAccountBase;