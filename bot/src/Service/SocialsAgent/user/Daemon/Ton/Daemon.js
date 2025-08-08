import EventEmitter from "./EventEmitter.js";
import AccountWatcher from "./Watcher/AccountWatcher.js";
import DialogsWatcher from "./Watcher/DialogsWatcher.js";
import MessagesWatcher from "./Watcher/MessagesWatcher.js";
import PuppeteerBrowserDaemonBase from "../../../lib/PuppeteerBrowserDaemonBase.js";
import MediaWatcher from "./Watcher/MediaWatcher.js";

class Daemon extends PuppeteerBrowserDaemonBase {

  watchers = {
    account: {
      store: {},
      watcher: null,
    },
    media: {
      store: {},
      watcher: null,
    },
    dialogs: {
      store: {
        requestDialogs: {
          queue: 0,
          nextFrom: 0,
          cache: [],
        },
      },
      watcher: null,
    },
    messages: {
      store: {
        requestMessages: {
          // dialogId key
        },
      },
      watcher: null,
    },
  };

  async launch() {
    await super.launch();

    const page = await this._browser.openNewTab(this);

    await page.setViewport({width: 414, height: 896});
    await page.setRequestInterception(true);

    this.watchers.account.watcher = await AccountWatcher.init(page);

    await page.goto(`https://ton.place/im`, {waitUntil: 'networkidle2', timeout: 60000});
    // await new Promise(resolve => setTimeout(resolve, 5000));

    // Break-wall.
/*    if (instance.watchers.account.getAccount().username !== username) {
      return instance;
    }*/

    this.watchers.dialogs.watcher = await DialogsWatcher.init(page, this.watchers.account.watcher.getAccount());
    this.watchers.messages.watcher = await MessagesWatcher.init(page, this.watchers.account.watcher.getAccount());
    this.watchers.media.watcher = await MediaWatcher.init(page, this.watchers.account.watcher.getAccount());

    this.eventEmitter = new EventEmitter(this.watchers);

    return this;
  }

}

export default Daemon;