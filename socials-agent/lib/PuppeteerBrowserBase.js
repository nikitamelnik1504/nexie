import BrowserBase from "./BrowserBase.js";

class PuppeteerBrowserBase extends BrowserBase {

  constructor(props) {
    super(props);
  }

  wsConnection = null;

  async detachDaemon(daemon) {
    const index = this.daemons.findIndex(d => d.instance === daemon);

    if (index === -1) {
      throw new Error('Daemon doesn\'t exist!');
    }

    for (const tab of this.daemons[index].tabs) {
      await this.closeTab(daemon, tab);
    }

    this.daemons.splice(index, 1);

    return this;
  }

  async openNewTab(daemon) {
    const daemonIndex = this.daemons.findIndex(d => d.instance === daemon);

    if (daemonIndex === -1) {
      throw new Error('Daemon not found.');
    }

    const newTab = await this.wsConnection.newPage();
    this.daemons[this.daemons.findIndex(d => d.instance === daemon)].tabs.push(newTab);

    return newTab;
  }

  async closeTab(daemon, tab) {
    const daemonIndex = this.daemons.findIndex(d => d.instance === daemon);

    if (daemonIndex === -1) {
      throw new Error('Daemon not found.');
    }

    const daemonTabIndex = this.daemons[daemonIndex].tabs.findIndex(t => t === tab);

    if (daemonTabIndex === -1) {
      throw new Error('Daemon tab not found.');
    }

    await tab.close();

    this.daemons[daemonIndex].tabs.splice(daemonTabIndex, 1);
  }
}

export default PuppeteerBrowserBase;