import MessagesCollectionBase from "../../../lib/Messenger/MessagesCollectionBase.js";

class MessagesCollection extends MessagesCollectionBase {

  synced = false;

  static create(_messenger, _dialog, browserDaemonEventEmitter) {
    const instance = new this(browserDaemonEventEmitter);
    instance._messenger = _messenger;
    instance._dialog = _dialog;

    return instance;
  }

}

export default MessagesCollection;