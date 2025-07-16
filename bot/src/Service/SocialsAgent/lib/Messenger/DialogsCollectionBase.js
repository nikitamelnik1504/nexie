class DialogsCollectionBase {

  _messenger;

  browserDaemonEventEmitter;

  collection = [];

  constructor(browserDaemonEventEmitter) {
    this.browserDaemonEventEmitter = browserDaemonEventEmitter;
  }

  static create(_messenger, browserDaemonEventEmitter) {
    const instance = new this(browserDaemonEventEmitter);
    instance._messenger = _messenger;
    return instance;
  }

  list(offset = 0, limit = 30) {
    const availableItems = this.collection.slice(offset);
    const itemsToReturn = availableItems.slice(0, limit);

    if (itemsToReturn.length < limit) {
      const remainingDialogs = limit - itemsToReturn.length;
      this.browserDaemonEventEmitter.requestDialogs(remainingDialogs);
    }

    return itemsToReturn;
  }

  addDialog(dialog) {
    this.collection.push(dialog);
    return dialog;
  }

  dialog(id) {
    return this.collection.find(dialog => dialog.id === id);
    // if dialog with id is not in collection - request from daemon.
  }

}

export default DialogsCollectionBase;