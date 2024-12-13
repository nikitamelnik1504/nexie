import SocialsAgentAccountBase from "./SocialsAgentAccountBase.js";

class SocialsAgentAccountFancentro extends SocialsAgentAccountBase {

  static PLATFORM_CONNECTION_STATUS = {
    0: 'Account is not authorized',
    1: 'Account is authorized',
    2: 'Account is not authorized because another account already logged in',
    3: 'Profile is not started',
    4: 'Profile is started out of bot',
    5: 'Profile is not found'
  }

  async getPlatformConnectionStatus() {
    if (await super.getPlatformConnectionStatus() === false) {
      return false;
    }

    switch (this.clientSettings.type) {
      case 'dolphin':
        try {
          const dolphinCommunicator = await this.service.getDolphinService().connect(this.clientSettings.params.apiUrl, this.clientSettings.params.authToken);
          const dolphinProfile = await dolphinCommunicator.profile(this.clientSettings.params.profile);

          if (!dolphinProfile) {
            return 5;
          }

          if (dolphinProfile.running === false) {
            return 3;
          } else if (dolphinProfile.running === true && dolphinProfile.wsEndpoint === null) {
            return 4;
          } else if (dolphinProfile.running === true && dolphinProfile.wsEndpoint !== null) {
            return await (await (await dolphinProfile.openBrowser()).openTab('fancentro')).getAuthorizationStatus(this.platformSettings.username);
          }

          return true;
        } catch (error) {
          console.log(error);
          return false;
        }
    }
  }

  async authorize() {
    // this.client.
  }

}

export default SocialsAgentAccountFancentro;