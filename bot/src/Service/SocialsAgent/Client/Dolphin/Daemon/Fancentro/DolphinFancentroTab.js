import EventEmitter from 'node:events';
import AuthorizationWatcher from "./Watcher/AuthorizationWatcher.js";
import AccountWatcher from "./Watcher/AccountWatcher.js";
import DialogsWatcher from "./Watcher/DialogsWatcher.js";
import MessagesWatcher from "./Watcher/MessagesWatcher.js";
import DaemonBase from "../DaemonBase.js";

class DolphinFancentroTab extends DaemonBase {

  cdp;

  watchers = {
    authorization: null,
    account: null,
    dialogs: null,
    messages: null
  };

  static async open(profile, browser) {
    const instance = new this(profile, browser);

    // Init page.
    instance.page = await instance.browser.newPage();

    await instance.page.setViewport({width: 414, height: 896});

    // Init CDP connection.
    instance.cdp = await instance.page.target().createCDPSession();
    await instance.cdp.send('Network.enable');

    // Init watchers.
    instance.watchers.authorization = await AuthorizationWatcher.init(instance.page, instance.cdp);
    instance.watchers.account = await AccountWatcher.init(instance.page, instance.cdp);
    instance.watchers.dialogs = await DialogsWatcher.init(instance.page, instance.cdp);
    instance.watchers.messages = await MessagesWatcher.init(instance.page, instance.cdp);

    // Init event eventEmitters.
    instance.eventEmitter = new class extends EventEmitter {
      me() {
        return instance.watchers.dialogs.getMe();
      }

      loadMessages(dialogId) {
        instance.watchers.messages.emit("loadMessages", dialogId);
      }

      sendMessage(dialogId, message) {
        instance.watchers.messages.emit("sendMessage", dialogId, message);
      }
    }();

    instance.watchers.dialogs.on("update", () => {
      instance.eventEmitter.emit('dialogs_update', instance.watchers.dialogs.getDialogs());
    });

    instance.watchers.messages.on("update", () => {
      instance.eventEmitter.emit('dialog_messages_update', instance.watchers.messages.getRoom());
    });

    instance.watchers.messages.on("new", (messageId) => {
      instance.eventEmitter.emit('dialog_message_new', instance.watchers.messages.getMessage(messageId));
    });

    return instance;
  }

  async getAccountUserId() {
    return this.watchers.account.getUserId();
  }

  async getAuthorizationStatus(username, login = null, password = null) {
    return await this.watchers.authorization.getStatus(username);
  }

  async close() {
    await this.cdp.detach();
    return this.page.close();
  }

}

export default DolphinFancentroTab;