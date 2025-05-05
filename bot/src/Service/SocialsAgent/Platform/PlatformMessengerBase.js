import EventEmitter from "node:events";

class PlatformMessengerBase extends EventEmitter {
  clientBrowserTabEventEmitter;
}

export default PlatformMessengerBase;