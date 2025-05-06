class MessagesCollection {

  _messenger;
  _dialog;

  clientBrowserDaemonEventEmitter;

  collection = [];

  synced = false;

  constructor(clientBrowserDaemonEventEmitter) {
    this.clientBrowserDaemonEventEmitter = clientBrowserDaemonEventEmitter;
  }

  static create(_messenger, _dialog, clientBrowserDaemonEventEmitter) {
    const instance = new this(clientBrowserDaemonEventEmitter);
    instance._messenger = _messenger;
    instance._dialog = _dialog;

    instance.clientBrowserDaemonEventEmitter.on('messagesList:' + instance._dialog.member.remote.id, (data) => {
      instance.synced = true;

      for (const message of data) {
        instance.addMessage(_messenger.getFactory().createMessage(instance, message));
      }

      instance._messenger.emit('messagesList', instance.collection); // @todo Replace with actually added.
    })

    instance.clientBrowserDaemonEventEmitter.on('messageNew:' + instance._dialog.member.remote.id, (data) => {

    });

    return instance;
  }

  addMessage(message) {
    const existingMessageIndex = this.collection.findIndex(
      messageFromCollection => message.remote.id === messageFromCollection.remote.id
    );

    if (existingMessageIndex !== -1) {
      this.collection[existingMessageIndex] = message;
    } else {
      this.collection.push(message);
    }

    return message;
  }

  list(offset = 0, limit = 30) {
    const availableItems = this.collection.toSorted((a, b) => b.timestamp - a.timestamp).slice(offset);
    const itemsToReturn = availableItems.slice(0, limit);

    if (itemsToReturn.length < limit) {
      const remainingMessages = limit - itemsToReturn.length;
      this.clientBrowserDaemonEventEmitter.requestMessages(this._dialog.member.remote.id, remainingMessages);
    }

    return itemsToReturn;
  }

  lastMessage() {
    return this.collection.toSorted((a, b) => b.timestamp - a.timestamp)[0];
  }


}

export default MessagesCollection;