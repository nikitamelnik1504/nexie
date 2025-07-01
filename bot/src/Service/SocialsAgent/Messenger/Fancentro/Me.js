import {v4 as uuid} from "uuid";

class Me {

  _messenger;

  browserDaemonEventEmitter;

  id;

  remote = {
    id: null,
    externalId: null,
  };

  username = null;

  constructor(browserDaemonEventEmitter, data) {
    this.browserDaemonEventEmitter = browserDaemonEventEmitter;

    this.id = uuid();
    this.remote.id = data.id;
    this.remote.externalId = data.externalId;
    this.username = data.username;
  }

  static create(_messenger, browserDaemonEventEmitter, data) {
    const instance = new this(browserDaemonEventEmitter, data);
    instance._messenger = _messenger;
    return instance;
  }

}

export default Me;