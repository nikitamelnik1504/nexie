import AccountBase from "../AccountBase.js";
import Messenger from "../../Platform/Ton/Messenger.js";

class TonAccount extends AccountBase {

  static PLATFORM_CONNECTION_STATUS = {
    0: 'Account is not authorized',
    1: 'Account is authorized',
  }

  async startPlatformConnection() {
    await this.startClientBrowser();

    const clientBrowserDaemon = await this.clientBrowser.launchDaemon(this.platformSettings.name, this.platformSettings.username);

    if (clientBrowserDaemon.watchers.dialogs === null) {
      this.platformConnectionStatus = 0;
      return;
    }

    this.messenger = await Messenger.init(clientBrowserDaemon);

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

export default TonAccount;