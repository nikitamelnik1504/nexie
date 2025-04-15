class DialogsCollection {

  me;

  collection = [];

  constructor(me) {
    this.me = me;
  }

  addDialog(dialog) {
    const matchedDialogIndex = this.collection.findIndex((existDialog) => existDialog.id === dialog.id);

    if (matchedDialogIndex !== -1) {
      this.collection[matchedDialogIndex] = dialog;
    }

    this.collection.push(dialog);

    return dialog;
  }

  getDialogByRemoteId(id) {
    return this.collection.find((dialog) => dialog.remoteId === id);
  }

  getDialogById(id) {
    return this.collection.find((dialog) => dialog.id === id);
  }

  getAllDialogs() {

  }

  getMembers() {
  }

}

export default DialogsCollection;