import AccountBase from "../AccountBase.js";
import Messenger from "../../Platform/Fancentro/Messenger.js";

class FancentroAccount extends AccountBase {

  static PLATFORM_CONNECTION_STATUS = {
    0: 'Account is not authorized',
    1: 'Account is authorized',
    2: 'Account is not authorized because another account already logged in',
  }

  async startPlatformConnection() {
    const platformTab = await this.clientConnection.openTab(this.platformSettings.name);

    if (await platformTab.getAuthorizationStatus(this.platformSettings.username)) {
      // if (!status) {
      //   return;
      // }
    }

    this.messenger = await Messenger.init(platformTab, this.platformSettings.username);
    this.platformConnectionStatus = 1;
  }

  async stopPlatformConnection() {
    await this.clientConnection.closeTab(this.platformSettings.name);
    // @todo Do messenger related things.
    this.messenger = null;
    this.platformConnectionStatus = null;
  }

}

export default FancentroAccount;