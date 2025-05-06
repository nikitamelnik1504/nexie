import {v4 as uuid} from "uuid";

class Member {

  clientBrowserDaemonEventEmitter;

  _messenger;
  _dialog;

  id;
  username;

  remote = {
    id: null,
    avatar: null,
  };

  constructor(clientBrowserDaemonEventEmitter, data) {
    this.clientBrowserDaemonEventEmitter = clientBrowserDaemonEventEmitter;
    this.id = uuid();

    this.remote.id = data.id;
    this.username = data.firstName;
  }

  static create(_messenger, _dialog, clientBrowserDaemonEventEmitter, data) {
    const instance = new this(clientBrowserDaemonEventEmitter, data);
    instance._messenger = _messenger;
    instance._dialog = _dialog;
    return instance;
  }

}

export default Member;