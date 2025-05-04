import SocialsAgentAccountBase from "../SocialsAgentAccountBase.js";
import Messenger from "../../Platform/Fancentro/Messenger.js";

class SocialsAgentAccountFancentro extends SocialsAgentAccountBase {

  static PLATFORM_CONNECTION_STATUS = {
    0: 'Account is not authorized',
    1: 'Account is authorized',
    2: 'Account is not authorized because another account already logged in',
    3: 'Profile is started out of bot',
    4: 'Profile is not found'
  }

  async getPlatformConnectionStatus() {
    return this.platformConnectionStatus;
  }

  async startPlatformConnection() {
    let platformTab;
    switch (this.clientSettings.type) {
      case 'dolphin':
        const dolphinProfile = await (await (await this.getClient()).profile(this.clientSettings.params.profile));

        if (!dolphinProfile) {
          this.platformConnectionStatus = 4;
          throw new Error(SocialsAgentAccountFancentro.PLATFORM_CONNECTION_STATUS[this.platformConnectionStatus]);
        }

        await dolphinProfile.start()

        if (dolphinProfile.running === false) {
          this.platformConnectionStatus = 2;
          throw new Error(SocialsAgentAccountFancentro.PLATFORM_CONNECTION_STATUS[this.platformConnectionStatus]);
        } else if (dolphinProfile.running === true && dolphinProfile.wsEndpoint === null) {
          this.platformConnectionStatus = 3;
          throw new Error(SocialsAgentAccountFancentro.PLATFORM_CONNECTION_STATUS[this.platformConnectionStatus]);
        }

        platformTab = await (await dolphinProfile.openBrowser()).openTab(this.platformSettings.name);
        break;
    }

    this.messenger = await Messenger.init(platformTab, this.platformSettings.username);
    this.platformConnectionStatus = 1;
  }

  async stopPlatformConnection() {
    switch (this.clientSettings.type) {
      case 'dolphin':
        const dolphinProfile = await (await (await this.getClient()).profile(this.clientSettings.params.profile));
        if (dolphinProfile.running === false) {
          return;
        }

        if (dolphinProfile.wsEndpoint === null || dolphinProfile.port === null) {
          await dolphinProfile.stop();
          this.platformConnectionStatus = 0;
          return;
        }

        const dolphinBrowser = await dolphinProfile.openBrowser();
        await dolphinBrowser.closeTab(this.platformSettings.name);
        if (!dolphinBrowser.isAnyTabOpen()) {
          dolphinProfile.closeBrowser();
          await dolphinProfile.stop();
          this.platformConnectionStatus = 0;
        }
        break;
    }
  }

}

export default SocialsAgentAccountFancentro;