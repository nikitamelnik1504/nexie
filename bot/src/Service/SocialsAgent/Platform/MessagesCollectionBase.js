class MessagesCollectionBase {
  _messenger;
  _dialog;

  clientBrowserDaemonEventEmitter;

  collection = [];

  constructor(clientBrowserDaemonEventEmitter) {
    this.clientBrowserDaemonEventEmitter = clientBrowserDaemonEventEmitter;
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
}

export default MessagesCollectionBase;