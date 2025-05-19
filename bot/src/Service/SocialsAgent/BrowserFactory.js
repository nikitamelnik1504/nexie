import DolphinBrowser from "./Browser/DolphinBrowser.js";

class BrowserFactory {

  _clientManager;

  constructor(_clientManager) {
    this._clientManager = _clientManager;
  }

  createBrowser(settings) {
    if (settings.type === 'dolphin') {
      return new DolphinBrowser(this._clientManager, settings.params.apiUrl, settings.params.authToken, settings.params.profile);
    }
  }

}

export default BrowserFactory;