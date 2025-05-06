import EventEmitter from "node:events";

class PlatformMessengerBase extends EventEmitter {
  clientBrowserDaemonEventEmitter;
  factory;

  dialogs = null;

  me = null;
}

export default PlatformMessengerBase;