class MessagesCollectionBase {
  _messenger;
  _dialog;

  browserDaemonEventEmitter;

  collection = [];

  constructor(browserDaemonEventEmitter) {
    this.browserDaemonEventEmitter = browserDaemonEventEmitter;
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

  lastMessage() {
    return this.collection.length > 0
      ? this.collection.toSorted((a, b) => b.timestamp - a.timestamp)[0]
      : null;
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

export default MessagesCollectionBase;