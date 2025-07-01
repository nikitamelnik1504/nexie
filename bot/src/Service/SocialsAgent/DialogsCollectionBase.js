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

    // Can be very proactive. `dialogsUpdate:<username>`
    instance.browserDaemonEventEmitter.on('dialogsList', (data) => {
      for (const dialog of data) {
        instance.addDialog(_messenger.getFactory().createDialog(instance, dialog));
      }

      // const matchedDialogIndex = instance.collection.findIndex((existDialog) => existDialog.id === dialog.id);

      instance._messenger.emit('dialogsList', instance.collection); // @todo Replace with actually added.
    });

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