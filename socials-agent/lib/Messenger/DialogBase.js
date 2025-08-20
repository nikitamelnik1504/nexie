class DialogBase {

  _messenger;
  _collection;

  browserDaemonEventEmitter;

  remote = {
    id: null,
  };

  id;
  member;
  messages;

  getMessages() {
    return this.messages;
  }

}

export default DialogBase;