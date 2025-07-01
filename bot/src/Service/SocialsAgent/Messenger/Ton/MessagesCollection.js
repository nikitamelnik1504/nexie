import MessagesCollectionBase from "../../MessagesCollectionBase.js";

class MessagesCollection extends MessagesCollectionBase {

  synced = false;

  static create(_messenger, _dialog, browserDaemonEventEmitter) {
    const instance = new this(browserDaemonEventEmitter);
    instance._messenger = _messenger;
    instance._dialog = _dialog;

    instance.browserDaemonEventEmitter.on('messagesList:' + instance._dialog.member.remote.id, (data) => {
      instance.synced = true;

      for (const message of data) {
        instance.addMessage(_messenger.getFactory().createMessage(instance, message));
      }

      instance._messenger.emit('messagesList', instance.collection); // @todo Replace with actually added.
    })

    instance.browserDaemonEventEmitter.on('messageNew:' + instance._dialog.member.remote.id, (data) => {
      const message = _messenger.getFactory().createMessage(instance, data);
      instance.addMessage(message);

      instance._messenger.emit('messageNew', instance.message(message.id));
    });

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