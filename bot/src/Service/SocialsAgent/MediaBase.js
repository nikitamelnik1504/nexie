import {v4 as uuid} from 'uuid';

class MediaBase {

  _messenger;
  _collection = null;

  browserDaemonEventEmitter;

  remote = {};

  id;

  constructor(browserDaemonEventEmitter, data) {
    this.browserDaemonEventEmitter = browserDaemonEventEmitter;

    this.id = uuid();
  }

  static create(_messenger, _collection = null, browserDaemonEventEmitter, data) {
    const instance = new this(browserDaemonEventEmitter, data);
    instance._messenger = _messenger;
    instance._collection = _collection;
    return instance;
  }
}

export default MediaBase;