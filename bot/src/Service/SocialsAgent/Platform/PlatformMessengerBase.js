import EventEmitter from "node:events";

class PlatformMessengerBase extends EventEmitter {
  clientBrowserDaemonEventEmitter;
  factory;

  dialogs = null;

  me = null;

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

export default PlatformMessengerBase;