import {v4 as uuid} from "uuid";

class Member {

  browserDaemonEventEmitter;

  _messenger;
  _dialog;

  id;
  username;

  remote = {
    id: null,
    externalId: null,
    avatar: null,
  };

  constructor(browserDaemonEventEmitter, data) {
    this.browserDaemonEventEmitter = browserDaemonEventEmitter;
    this.id = uuid();

    this.remote.id = data.id;
    this.remote.externalId = data.externalId;
    this.username = data.originName;
  }

  static create(_messenger, _dialog, browserDaemonEventEmitter, data) {
    const instance = new this(browserDaemonEventEmitter, data);
    instance._messenger = _messenger;
    instance._dialog = _dialog;
    return instance;
  }

}

export default Member;