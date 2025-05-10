import FancentroDaemon from "./Daemon/Fancentro/FancentroDaemon.js";
import DolphinFanslyTab from "./Daemon/Fansly/DolphinFanslyTab.js";
import TonDaemon from "./Daemon/Ton/TonDaemon.js";

class DolphinBrowser {

  daemons = [];

  constructor(browser) {
    this.browser = browser;
  }

  async launchDaemon(siteName, username) {
    let daemon;

    let daemonInstances = this.daemons.filter(daemon => {
        switch (siteName) {
          case 'fancentro':
            return daemon instanceof FancentroDaemon;
          case 'ton':
            return daemon instanceof TonDaemon;
        }
      }
    );
    if (daemonInstances.length !== 0) {
      daemon = daemonInstances[0];
    } else {
      switch (siteName) {
        case 'fancentro':
          daemon = await FancentroDaemon.launch(await this.browser, username);
          break;
        case 'ton':
          daemon = await TonDaemon.launch(await this.browser, username);
          break;
        case 'fansly':
          daemon = new DolphinFanslyTab(await this.browser);
          break;
      }
      this.daemons.push(daemon);
    }

    return daemon;
  }

  async stopDaemon(siteName) {
    let daemonInstances = this.daemons.filter(daemon => {
        switch (siteName) {
          case 'fancentro':
            return daemon instanceof FancentroDaemon;
          case 'ton':
            return daemon instanceof TonDaemon;
        }
      }
    );

    if (daemonInstances.length === 0) {
      return;
    }

    const daemonInstance = daemonInstances[0];

    await daemonInstance.close();

    const index = this.daemons.indexOf(daemonInstance);
    if (index > -1) {
      this.daemons.splice(index, 1);
    }
  }

  isAnyDaemonRunning() {
    return this.daemons.length > 0;
  }

}

export default DolphinBrowser;