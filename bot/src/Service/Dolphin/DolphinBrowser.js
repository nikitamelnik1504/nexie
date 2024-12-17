import DolphinFancentroTab from "./Browser/DolphinFancentroTab.js";
import DolphinFanslyTab from "./Browser/DolphinFanslyTab.js";
import DolphinTonTab from "./Browser/DolphinTonTab.js";

class DolphinBrowser {

  tabs = [];
  profile;

  constructor(profile, browser) {
    this.profile = profile;
    this.browser = browser;
  }

  async openTab(siteName) {
    let tab;

    let tabInstances = this.tabs.filter(tab => {
        if (siteName === 'fancentro') {
          return tab instanceof DolphinFancentroTab;
        }
      }
    );
    if (tabInstances.length !== 0) {
      tab = tabInstances[0];
    } else {
      switch (siteName) {
        case 'fancentro':
          tab = await DolphinFancentroTab.open(this.profile, await this.browser);
          break;
        case 'fansly':
          tab = new DolphinFanslyTab(this.profile, await this.browser);
          break;
        case 'ton':
          tab = new DolphinTonTab(this.profile, await this.browser);
          break;
      }
      this.tabs.push(tab);
    }

    return tab;
  }

}

export default DolphinBrowser;