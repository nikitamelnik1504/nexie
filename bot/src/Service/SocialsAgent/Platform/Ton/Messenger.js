import PlatformMessengerBase from "../PlatformMessengerBase.js";
import MessengerFactory from "./MessengerFactory.js";

class Messenger extends PlatformMessengerBase {

  static async init(clientBrowserDaemon) {
    const instance = new this();

    instance.clientBrowserDaemonEventEmitter = clientBrowserDaemon.getEventEmitter();
    instance.factory = new MessengerFactory(instance, instance.clientBrowserDaemonEventEmitter);

    instance.me = instance.factory.createMe(instance.clientBrowserDaemonEventEmitter.getMe());
    instance.dialogs = instance.factory.createDialogsCollection();

    return instance;
  }

  getDialogs() {
    return this.dialogs;
  }

  getMe() {
    return this.me;
  }

  getFactory() {
    return this.factory;
  }

}

export default Messenger;