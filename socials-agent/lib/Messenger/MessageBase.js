import {v4 as uuid} from "uuid";

class MessageBase {

  _messenger;
  _collection;

  browserDaemonEventEmitter;

  remote = {};

  id;

  constructor(_messenger, _collection, browserDaemonEventEmitter, data) {
    this._messenger = _messenger;
    this._collection = _collection;
    this.browserDaemonEventEmitter = browserDaemonEventEmitter;
    this.id = uuid();
  }

}

export default MessageBase;