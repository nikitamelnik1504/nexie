import EventEmitter from "node:events";
import Me from "./Dialogs/Me.js";
import DialogsCollection from "./Dialogs/DialogsCollection.js";
import Dialog from "./Dialogs/Dialog.js";

class Messenger extends EventEmitter {

  dialogs = null;

  authorizationStatus;

  runtime;

  static async init(tab, username) {
    const instance = new this();

    instance.authorizationStatus = await tab.getAuthorizationStatus(username);
    // if (this.platformConnectionStatus !== 1) {
    //   return;
    // }
    instance.runtime = tab.getMessengerLive();
    instance.runtime.on('dialogs_update', (data) => {
      if (instance.dialogs === null) {
        const me = new Me({...instance.runtime.me(), username});
        instance.dialogs = new DialogsCollection(me);
      }

      for (const receivedDialog of data) {
        instance.dialogs.addDialog(new Dialog(receivedDialog));
      }
    });

    // platformMessengerRuntime.on('dialog_messages_update', (data) => {
    //   for (const receivedDialog of data) {
    //     this.dialogs.push({
    //       id: receivedDialog.id,
    //       timestamp: receivedDialog.timestamp,
    //       userId: receivedDialog.userId,
    //       userExternalId: receivedDialog.userExternalId,
    //       userName: receivedDialog.userName,
    //       lastMessage: receivedDialog.message,
    //       messages: [],
    //     });
    //   }
    // });

    return instance;
  }

  getDialogs() {
    return this.dialogs;
  }
}

export default Messenger;