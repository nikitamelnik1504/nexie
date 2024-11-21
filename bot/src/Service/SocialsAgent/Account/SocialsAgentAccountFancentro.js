import SocialsAgentAccountBase from "./SocialsAgentAccountBase.js";

class SocialsAgentAccountFancentro extends SocialsAgentAccountBase {

  static PLATFORM_CONNECTION_STATUS = {
    0: 'Account is not authorized',
    1: 'Account is authorized',
    2: 'Profile is not started',
    3: 'Profile is started out of bot'
  }

  async getPlatformConnectionStatus() {
    if (await super.getPlatformConnectionStatus() === false) {
      return false;
    }

    switch (this.clientSettings.type) {
      case 'dolphin':
        try {
          const dolphinCommunicator = await this.service.getDolphinService().connect(this.clientSettings.apiUrl, this.clientSettings.authToken);
          const dolphinProfile = await dolphinCommunicator.profile(this.clientSettings.profile);

          if (dolphinProfile.running === false) {
            return 2;
          }
          else if (dolphinProfile.running === true && dolphinProfile.wsEndpoint === null) {
            return 3;
          }
          else if (dolphinProfile.running === true && dolphinProfile.wsEndpoint !== null) {
            await dolphinProfile.openBrowser('fancentro');
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