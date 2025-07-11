import {v4 as uuid} from "uuid";

class AttachmentBase {

  _messenger;
  _message;

  browserDaemonEventEmitter;

  id;

  constructor(browserDaemonEventEmitter, data) {
    this.browserDaemonEventEmitter = browserDaemonEventEmitter;

    this.id = uuid();
  }

  static create(_messenger, _message, browserDaemonEventEmitter, data) {
    const instance = new this(browserDaemonEventEmitter, data);
    instance._messenger = _messenger;
    instance._message = _message;
    return instance;
  }

}

export default AttachmentBase;