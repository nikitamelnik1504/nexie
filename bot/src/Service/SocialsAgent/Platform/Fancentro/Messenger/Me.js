import {v4 as uuid} from "uuid";

class Me {

  _messenger;

  clientBrowserDaemonEventEmitter;

  id;

  remote = {
    id: null,
    externalId: null,
  };

  username = null;

  constructor(clientBrowserDaemonEventEmitter, data) {
    this.clientBrowserDaemonEventEmitter = clientBrowserDaemonEventEmitter;

    this.id = uuid();
    this.remote.id = data.id;
    this.remote.externalId = data.externalId;
    this.username = data.username;
  }

  static create(_messenger, clientBrowserDaemonEventEmitter, data) {
    const instance = new this(clientBrowserDaemonEventEmitter, data);
    instance._messenger = _messenger;
    return instance;
  }

}

export default Me;