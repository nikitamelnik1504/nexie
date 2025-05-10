import EventEmitter from "node:events";

class DaemonBase {

  browser;

  page;

  eventEmitter;

  watchers = {};

  constructor(browser) {
    this.browser = browser;
  }

  static async launch(browser) {
    const instance = new this(browser);
    instance.page = await instance.browser.newPage();
    instance.eventEmitter = new class extends EventEmitter {}();
    return instance;
  }

  getEventEmitter() {
    return this.eventEmitter;
  }

  async close() {
    return this.page.close();
  }

}

export default DaemonBase;