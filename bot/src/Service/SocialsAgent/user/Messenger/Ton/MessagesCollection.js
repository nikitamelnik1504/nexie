import MessagesCollectionBase from "../../../lib/Messenger/MessagesCollectionBase.js";

class MessagesCollection extends MessagesCollectionBase {

  synced = false;

  static create(_messenger, _dialog, browserDaemonEventEmitter) {
    const instance = new this(browserDaemonEventEmitter);
    instance._messenger = _messenger;
    instance._dialog = _dialog;

    return instance;
  }

  list(offset = 0, limit = 30) {
    const availableItems = this.collection.toSorted((a, b) => b.timestamp - a.timestamp).slice(offset);
    const itemsToReturn = availableItems.slice(0, limit);

    if (itemsToReturn.length < limit) {
      const remainingMessages = limit - itemsToReturn.length;
      this.browserDaemonEventEmitter.requestMessages(this._dialog.member.remote.id, remainingMessages);
    }

    return itemsToReturn;
  }

}

export default MessagesCollection;