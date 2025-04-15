class MessagesCollection {

  collection = [];

  loaded = false;

  getLast() {
  }

  addMessage(message) {
    this.collection.push(message);
  }

}

export default MessagesCollection;