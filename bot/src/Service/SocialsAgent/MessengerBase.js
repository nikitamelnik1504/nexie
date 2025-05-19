/**
 * @todo 0.3.0
 * @todo Implement new architecture. We open dolphin to get browser. Not open browser to get dolphin.
 */
import EventEmitter from "node:events";
import BrowserFactory from "./BrowserFactory.js";
import BrowserDaemonFactory from "./BrowserDaemonFactory.js";

class MessengerBase extends EventEmitter {

  _clientManager;
  _browserManager;

  clientSettings;
  platformSettings;

  daemon;

  factory;

  dialogs = null;
  me = null;

  static PLATFORM_CONNECTION_STATUS = {
    0: 'Account is not authorized',
    1: 'Account is authorized',
  }

  constructor(clientManager, browserManager, clientSettings, platformSettings) {
    super();
    this._clientManager = clientManager;
    this._browserManager = browserManager;
    this.clientSettings = clientSettings;
    this.platformSettings = platformSettings;
  }

  async start() {
    let browser = this._browserManager.get(this.clientSettings);

    if (!browser) {
      const browserFactory = new BrowserFactory(this._clientManager);
      browser = this._browserManager.add(this.clientSettings, browserFactory.createBrowser(this.clientSettings));
      await browser.start();
    }

    const browserDaemonFactory = new BrowserDaemonFactory();
    this.daemon = browserDaemonFactory.createPuppeteerBrowserDaemon(this.platformSettings);
    await browser.attachDaemon(this.daemon);
    await this.daemon.launch();

    return this;
  }

  async stop() {
    await this.daemon.stop();

    let browser = this._browserManager.get(this.clientSettings);
    try {
      await browser.detachDaemon(this.daemon);
      await browser.stop();
      this._browserManager.remove(browser);
    } catch (error) {
      console.error(error);
    }

    return this;
  }

  getMe() {
    return this.me;
  }

  getDialogs() {
    return this.dialogs;
  }

  getFactory() {
    return this.factory;
  }
}

export default MessengerBase;