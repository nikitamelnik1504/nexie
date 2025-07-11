import EventEmitter from "node:events";
import AccountWatcher from "./Watcher/AccountWatcher.js";
import DialogsWatcher from "./Watcher/DialogsWatcher.js";
import MessagesWatcher from "./Watcher/MessagesWatcher.js";
import PuppeteerBrowserDaemonBase from "../../PuppeteerBrowserDaemonBase.js";
import MediaWatcher from "./Watcher/MediaWatcher.js";

class TonDaemon extends PuppeteerBrowserDaemonBase {

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

/*    if (instance.watchers.account.getAccount().username !== username) {
      return instance;
    }*/

    this.watchers.dialogs.watcher = await DialogsWatcher.init(page, this.watchers.account.watcher.getAccount());

    this.watchers.messages.watcher = await MessagesWatcher.init(page, this.watchers.account.watcher.getAccount());

    this.watchers.media.watcher = await MediaWatcher.init(page, this.watchers.account.watcher.getAccount());

    const instance = this;
    this.eventEmitter = new class extends EventEmitter {
      getMe() {
        return instance.watchers.dialogs.watcher.account;
      }

      requestDialogs(count) {
        const DIALOGS_RETURNING_PER_REQUEST = 50;
        instance.watchers.dialogs.store.requestDialogs.queue = Math.ceil(+count / DIALOGS_RETURNING_PER_REQUEST);
        instance.watchers.dialogs.watcher.requestDialogs(instance.watchers.dialogs.store.requestDialogs.nextFrom);
      }

      requestMessages(dialogId, count) {
        if (!(dialogId in instance.watchers.messages.store.requestMessages)) {
          instance.watchers.messages.store.requestMessages[dialogId] = {
            queue: 0,
            nextFrom: 0,
            cache: [],
          };
        }

        const MESSAGES_RETURNING_PER_REQUEST = 50;
        instance.watchers.messages.store.requestMessages[dialogId].queue = Math.ceil(+count / MESSAGES_RETURNING_PER_REQUEST);

        if (instance.watchers.messages.store.requestMessages[dialogId].nextFrom === '') {
          return;
        }

        instance.watchers.messages.watcher.requestMessages(dialogId, instance.watchers.messages.store.requestMessages[dialogId].nextFrom);
      }

      requestAlbums() {
        instance.watchers.media.watcher.requestAlbums();
      }

      requestMedia(albumId, count) {
        instance.watchers.media.watcher.requestMedia(albumId, 0);
      }
      
      sendMessage(dialogId, message, attachments = [], _bag = {}) {
        instance.watchers.messages.watcher.sendMessage(dialogId, message, _bag);
      }
    }();

    this.watchers.dialogs.watcher.on("dialogsList", (data) => {
      for (const dialog of data.list) {
        this.watchers.dialogs.store.requestDialogs.cache.push(dialog);
      }

      this.watchers.dialogs.store.requestDialogs.queue -= 1;

      if (data.nextFrom === '') {
        this.watchers.dialogs.store.requestDialogs.queue = 0;
        this.watchers.dialogs.store.requestDialogs.nextFrom = data.nextFrom;
      } else {
        this.watchers.dialogs.store.requestDialogs.nextFrom = +data.nextFrom;
      }

      if (this.watchers.dialogs.store.requestDialogs.queue !== 0) {
        this.watchers.dialogs.watcher.requestDialogs(this.watchers.dialogs.store.requestDialogs.nextFrom);
      } else {
        if (this.watchers.dialogs.store.requestDialogs.cache.length === 0) {
          return;
        }

        this.eventEmitter.emit('dialogsList', this.watchers.dialogs.store.requestDialogs.cache);
        this.watchers.dialogs.store.requestDialogs.cache.length = 0;
      }
    })

    this.watchers.messages.watcher.on("messagesList", (data) => {
      for (const message of data.list) {
        this.watchers.messages.store.requestMessages[data.memberId].cache.push(message);
      }

      this.watchers.messages.store.requestMessages[data.memberId].queue -= 1;

      if (data.nextFrom === '') {
        this.watchers.messages.store.requestMessages[data.memberId].queue = 0;
        this.watchers.messages.store.requestMessages[data.memberId].nextFrom = data.nextFrom;
      } else {
        this.watchers.messages.store.requestMessages[data.memberId].nextFrom = +data.nextFrom;
      }

      if (this.watchers.messages.store.requestMessages[data.memberId].queue !== 0) {
        this.watchers.messages.watcher.requestMessages(data.memberId, this.watchers.messages.store.requestMessages[data.memberId].nextFrom);
      } else {
        if (this.watchers.messages.store.requestMessages[data.memberId].cache.length === 0) {
          return;
        }

        this.eventEmitter.emit('messagesList:' + data.memberId, this.watchers.messages.store.requestMessages[data.memberId].cache);
        this.watchers.messages.store.requestMessages[data.memberId].cache.length = 0;
      }
    });

    this.watchers.messages.watcher.on("messageSent", (data, _bag) => {
      this.eventEmitter.emit('messageSent:' + data.memberId, data, _bag);
    });

    this.watchers.messages.watcher.on("messageNew", (data) => {
      this.eventEmitter.emit('messageNew:' + data.user.id, data.message);
    });

    this.watchers.media.watcher.on("albumsList", (data) => {
      this.eventEmitter.emit('albumsList', data.list);
    });

    this.watchers.media.watcher.on("albumMediasList", (data) => {
      this.eventEmitter.emit('albumMediasList:' + data.albumId, data.list);
    });

    return instance;
  }

}

export default TonDaemon;