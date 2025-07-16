import {v4 as uuid} from 'uuid';

class MediaBase {

  _messenger;

  browserDaemonEventEmitter;

  remote = {};

  id;

  constructor(browserDaemonEventEmitter, data) {
    this.browserDaemonEventEmitter = browserDaemonEventEmitter;

    this.id = uuid();
  }

  static create(_messenger, browserDaemonEventEmitter, data) {
    const instance = new this(browserDaemonEventEmitter, data);
    instance._messenger = _messenger;
    return instance;
  }
}

export default MediaBase;