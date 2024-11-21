import DolphinFancentroTab from "./Browser/DolphinFancentroTab.js";
import DolphinFanslyTab from "./Browser/DolphinFanslyTab.js";
import DolphinTonTab from "./Browser/DolphinTonTab.js";

class DolphinBrowser {

  tabs = [];

  constructor(browser) {
    this.browser = browser;
  }

  async openTab(siteName) {
    let tab;

    switch (siteName) {
      case 'fancentro':
        tab = await DolphinFancentroTab.open(await this.browser.newPage());
        break;
      case 'fansly':
        tab = new DolphinFanslyTab(await this.browser.newPage());
        break;
      case 'ton':
        tab = new DolphinTonTab(await this.browser.newPage());
        break;
    }

    this.tabs.push(tab);

    return tab;
  }

}

export default DolphinBrowser;