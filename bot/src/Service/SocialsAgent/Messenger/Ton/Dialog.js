import {v4 as uuid} from "uuid";
import DialogBase from "../../DialogBase.js";

class Dialog extends DialogBase {

  constructor(clientBrowserDaemonEventEmitter, data) {
    super();
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
        instance.messages.addMessage(instance._messenger.getFactory().createMessage(instance.messages, message));
      }
    }

    instance.clientBrowserDaemonEventEmitter.on('dialogUpdate:' + instance.remote.id, (data) => {
      // @todo Logic.
    });

    return instance;
  }

}

export default Dialog;