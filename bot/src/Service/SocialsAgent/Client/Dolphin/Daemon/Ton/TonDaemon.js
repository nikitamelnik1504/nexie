import EventEmitter from "node:events";
import DaemonBase from "../DaemonBase.js";
import AccountWatcher from "./Watcher/AccountWatcher.js";
import DialogsWatcher from "./Watcher/DialogsWatcher.js";
import MessagesWatcher from "./Watcher/MessagesWatcher.js";

class TonDaemon extends DaemonBase {

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

  static async launch(browser, username) {
    const instance = new this(browser);
    instance.page = await instance.browser.newPage();
    await instance.page.setViewport({width: 414, height: 896});
    await instance.page.setRequestInterception(true);

    instance.watchers.account = await AccountWatcher.init(instance.page);
    await instance.page.goto(`https://ton.place/im`, {waitUntil: 'networkidle2', timeout: 60000});
    // await new Promise(resolve => setTimeout(resolve, 5000));

    if (instance.watchers.account.getAccount().username !== username) {
      return instance;
    }

    instance.watchers.dialogs.watcher = await DialogsWatcher.init(instance.page, instance.watchers.account.getAccount());

    instance.watchers.messages.watcher = await MessagesWatcher.init(instance.page, instance.watchers.account.getAccount());

    instance.eventEmitter = new class extends EventEmitter {
      getMe() {
        return instance.watchers.dialogs.watcher.account;
      }

      requestDialogs(count) {
        const DIALOGS_RETURNING_PER_REQUEST = 50;
        instance.watchers.dialogs.store.requestDialogs.queue = Math.ceil(+count / DIALOGS_RETURNING_PER_REQUEST);
        instance.watchers.dialogs.watcher.requestDialogs(instance.watchers.dialogs.store.requestDialogs.nextFrom);
      }

      requestMessages(memberId, count) {
        if (!(memberId in instance.watchers.messages.store.requestMessages)) {
          instance.watchers.messages.store.requestMessages[memberId] = {
            queue: 0,
            nextFrom: 0,
            cache: [],
          };
        }

        const MESSAGES_RETURNING_PER_REQUEST = 50;
        instance.watchers.messages.store.requestMessages[memberId].queue = Math.ceil(+count / MESSAGES_RETURNING_PER_REQUEST);

        if (instance.watchers.messages.store.requestMessages[memberId].nextFrom === '') {
          return;
        }

        instance.watchers.messages.watcher.requestMessages(memberId, instance.watchers.messages.store.requestMessages[memberId].nextFrom);
      }

      sendMessage(memberId, message, _bag = {}) {
        instance.watchers.messages.watcher.sendMessage(memberId, message, _bag);
      }
    }();

    instance.watchers.dialogs.watcher.on("dialogsList", (data) => {
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

    instance.watchers.messages.watcher.on("messagesList", (data) => {
      for (const message of data.list) {
        instance.watchers.messages.store.requestMessages[data.memberId].cache.push(message);
      }

      instance.watchers.messages.store.requestMessages[data.memberId].queue -= 1;

      if (data.nextFrom === '') {
        instance.watchers.messages.store.requestMessages[data.memberId].queue = 0;
        instance.watchers.messages.store.requestMessages[data.memberId].nextFrom = data.nextFrom;
      } else {
        instance.watchers.messages.store.requestMessages[data.memberId].nextFrom = +data.nextFrom;
      }

      if (instance.watchers.messages.store.requestMessages[data.memberId].queue !== 0) {
        instance.watchers.messages.watcher.requestMessages(data.memberId, instance.watchers.messages.store.requestMessages[data.memberId].nextFrom);
      } else {
        if (instance.watchers.messages.store.requestMessages[data.memberId].cache.length === 0) {
          return;
        }

        instance.eventEmitter.emit('messagesList:' + data.memberId, instance.watchers.messages.store.requestMessages[data.memberId].cache);
        instance.watchers.messages.store.requestMessages[data.memberId].cache.length = 0;
      }
    });

    instance.watchers.messages.watcher.on("messageSent", (data, _bag) => {
      instance.eventEmitter.emit('messageSent:' + data.memberId, data, _bag);
    });

    return instance;
  }

}

export default TonDaemon;