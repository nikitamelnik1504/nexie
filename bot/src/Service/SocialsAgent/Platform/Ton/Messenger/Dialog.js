import {v4 as uuid} from "uuid";
import Member from "./Member.js";

class Dialog {

  _messenger;
  _collection;

  clientBrowserDaemonEventEmitter;

  remote = {
    id: null,
  };

  id;
  member;
  messages;

  constructor(clientBrowserDaemonEventEmitter, data) {
    this.clientBrowserDaemonEventEmitter = clientBrowserDaemonEventEmitter;

    this.id = uuid();
    this.remote.id = data.id;
  }

  static create(_messenger, _collection, clientBrowserDaemonEventEmitter, data) {
    const instance = new this(clientBrowserDaemonEventEmitter, data);
    instance._messenger = _messenger;
    instance._collection = _collection;

    instance.member = _messenger.getFactory().createMember(instance, data.user);

    instance.messages = instance._messenger.getFactory().createMessagesCollection(instance);

    if (data.messages) {
      for (const message of data.messages) {
        instance.messages.addMessage(instance._messenger.getFactory().createMessage(instance.messages, message),);
      }
    }

    instance.clientBrowserDaemonEventEmitter.on('dialogUpdate:' + instance.remote.id, (data) => {
      // @todo Logic.
    });

    return instance;
  }

  getMessages() {
    return this.messages;
  }

}

export default Dialog;