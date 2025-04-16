class MessagesCollection {

  _dialog;

  collection = [];

  loaded = false;

  getLast() {
  }

  addMessage(message) {
    message._collection = this;
    this.collection.push(message);
  }

  getMessageById(id) {
    this.collection.find(message => message.id === id);
  }

  getFirstMatchedUnsentMessageByText(text) {
    return this.collection.find(message => message.text === text && message.remoteId === null);
  }

  toJSON() {
    return {
      collection: this.collection,
    };
  }

}

export default MessagesCollection;