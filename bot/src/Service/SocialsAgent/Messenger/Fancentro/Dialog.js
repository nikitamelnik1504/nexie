import {v4 as uuid} from "uuid";
import DialogBase from "../../DialogBase.js";

class Dialog extends DialogBase {

  constructor(browserDaemonEventEmitter, data) {
    super();
    this.browserDaemonEventEmitter = browserDaemonEventEmitter;

    this.id = uuid();
    this.remote.id = data.room._id;
  }

  static create(_messenger, _collection, browserDaemonEventEmitter, data) {
    const instance = new this(browserDaemonEventEmitter, data);
    instance._messenger = _messenger;
    instance._collection = _collection;

    instance.member = _messenger.getFactory().createMember(instance, data.memberData);

    instance.messages = instance._messenger.getFactory().createMessagesCollection(instance);

    if (data.room.messages) {
      for (const message of data.room.messages) {
        if (message === null) {
          continue;
        }

        instance.messages.addMessage(instance._messenger.getFactory().createMessage(instance.messages, message));
      }
    }

    instance.browserDaemonEventEmitter.on('dialogUpdate:' + instance.remote.id, (data) => {
      // @todo Logic.
    });

    return instance;
  }

}

export default Dialog;