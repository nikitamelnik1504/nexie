import DolphinBrowser from "../user/Browser/DolphinBrowser.js";
import SystemBrowser from "../user/Browser/SystemBrowser.js";

class BrowserFactory {

  _clientManager;

  constructor(_clientManager) {
    this._clientManager = _clientManager;
  }

  createBrowser(settings) {
    if (settings.type === 'dolphin') {
      return new DolphinBrowser(this._clientManager, settings.params.apiUrl, settings.params.authToken, settings.params.profile);
    }

    if (settings.type === 'system') {
      return new SystemBrowser(this._clientManager);
    }
  }

}

export default BrowserFactory;