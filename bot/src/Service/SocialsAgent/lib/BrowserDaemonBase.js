import DaemonBase from "./DaemonBase.js";

class BrowserDaemonBase extends DaemonBase {

  _browser;

  setBrowser(browser) {
    this._browser = browser;
  }

}

export default BrowserDaemonBase;