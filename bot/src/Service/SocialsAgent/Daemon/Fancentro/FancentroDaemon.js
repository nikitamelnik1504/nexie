import EventEmitter from 'node:events';
import AccountWatcher from "./Watcher/AccountWatcher.js";
import DialogsWatcher from "./Watcher/DialogsWatcher.js";
import MessagesWatcher from "./Watcher/MessagesWatcher.js";
import DaemonBase from "../../DaemonBase.js";

class FancentroDaemon extends DaemonBase {

  watchers = {
    account: null,
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
    this.page = await this.browser.newPage();
    await this.page.setViewport({width: 414, height: 896});

    // Init CDP connection.
    const cdp = await this.page.target().createCDPSession();
    await cdp.send('Network.enable');

    this.watchers.account = await AccountWatcher.init(this.page, cdp);
    await this.page.goto(`https://fancentro.com/admin/messages`, {waitUntil: 'networkidle0', timeout: 60000});

    this.watchers.dialogs.watcher = await DialogsWatcher.init(this.page, this.watchers.account.getAccount());
    this.watchers.messages.watcher = await MessagesWatcher.init(this.page, this.watchers.account.getAccount());

    const instance = this;
    this.eventEmitter = new class extends EventEmitter {
      getMe() {
        return instance.watchers.dialogs.watcher.account;
      }

      requestDialogs(count) {
        const DIALOGS_RETURNING_PER_REQUEST = 50;
        instance.watchers.dialogs.store.requestDialogs.queue = Math.ceil(+count / DIALOGS_RETURNING_PER_REQUEST);
        instance.watchers.dialogs.watcher.requestDialogs(DIALOGS_RETURNING_PER_REQUEST, instance.watchers.dialogs.store.requestDialogs.nextFrom);
      }

      requestMessages(dialogId, count) {
        if (!(dialogId in instance.watchers.messages.store.requestMessages)) {
          instance.watchers.messages.store.requestMessages[dialogId] = {
            queue: 0,
            bucketId: 0,
            cache: [],
          };
        }

        const MESSAGES_RETURNING_PER_REQUEST = 50;
        instance.watchers.messages.store.requestMessages[dialogId].queue = Math.ceil(+count / MESSAGES_RETURNING_PER_REQUEST);

        if (instance.watchers.messages.store.requestMessages[dialogId].bucketId === '') {
          return;
        }

        instance.watchers.messages.watcher.requestMessages(dialogId, instance.watchers.messages.store.requestMessages[dialogId].bucketId);
      }

      sendMessage(dialogId, message, _bag = {}) {
        instance.watchers.messages.watcher.sendMessage(dialogId, message, _bag);
      }
    }();

    this.watchers.dialogs.watcher.on("dialogsList", (data) => {
      for (const dialog of data.list) {
        instance.watchers.dialogs.store.requestDialogs.cache.push(dialog);
      }

      instance.watchers.dialogs.store.requestDialogs.queue -= 1;

      if (data.nextFrom === '') {
        instance.watchers.dialogs.store.requestDialogs.queue = 0;
        instance.watchers.dialogs.store.requestDialogs.nextFrom = data.nextFrom;
      } else {
        instance.watchers.dialogs.store.requestDialogs.nextFrom = +data.nextFrom;
      }

      if (instance.watchers.dialogs.store.requestDialogs.queue !== 0) {
        instance.watchers.dialogs.watcher.requestDialogs(instance.watchers.dialogs.store.requestDialogs.nextFrom);
      } else {
        if (instance.watchers.dialogs.store.requestDialogs.cache.length === 0) {
          return;
        }

        instance.eventEmitter.emit('dialogsList', instance.watchers.dialogs.store.requestDialogs.cache);
        instance.watchers.dialogs.store.requestDialogs.cache.length = 0;
      }
    })

    this.watchers.messages.watcher.on("messagesList", (data) => {
      for (const message of data.list) {
        instance.watchers.messages.store.requestMessages[data.dialogId].cache.push(message);
      }

      instance.watchers.messages.store.requestMessages[data.dialogId].queue -= 1;

      if (data.bucketId === '') {
        instance.watchers.messages.store.requestMessages[data.dialogId].queue = 0;
        instance.watchers.messages.store.requestMessages[data.dialogId].bucketId = data.bucketId;
      } else {
        instance.watchers.messages.store.requestMessages[data.dialogId].bucketId = data.bucketId;
      }

      if (instance.watchers.messages.store.requestMessages[data.dialogId].queue !== 0) {
        instance.watchers.messages.watcher.requestMessages(data.dialogId, instance.watchers.messages.store.requestMessages[data.dialogId].bucketId);
      } else {
        if (instance.watchers.messages.store.requestMessages[data.dialogId].cache.length === 0) {
          return;
        }

        instance.eventEmitter.emit('messagesList:' + data.dialogId, instance.watchers.messages.store.requestMessages[data.dialogId].cache);
        instance.watchers.messages.store.requestMessages[data.dialogId].cache.length = 0;
      }
    })

    this.watchers.messages.watcher.on("messageSent", (data, _bag) => {
      instance.eventEmitter.emit('messageSent:' + data.room, data, _bag);
    });

    this.watchers.messages.watcher.on("messageNew", (data) => {
      instance.eventEmitter.emit('messageNew:' + data.room, data);
    })

    // await cdp.detach();

    return this;
  }

}

export default FancentroDaemon;