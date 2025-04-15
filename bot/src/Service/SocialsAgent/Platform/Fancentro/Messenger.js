import EventEmitter from "node:events";
import Me from "./Dialogs/Me.js";
import DialogsCollection from "./Dialogs/DialogsCollection.js";
import Dialog from "./Dialogs/Dialog.js";
import Message from "./Dialogs/Message.js";

/**
 * Central place where all messages related functionality located in.
 *
 * Here will be located cache, delayed messages and all custom functionality.
 */
class Messenger extends EventEmitter {

  dialogs = null;

  authorizationStatus;

  clientBrowserTabEmitter;

  static async init(tab, username) {
    const instance = new this();

    instance.authorizationStatus = await tab.getAuthorizationStatus(username);
    // if (this.platformConnectionStatus !== 1) {
    //   return;
    // }
    instance.clientBrowserTabEmitter = tab.getEventEmitter();

    instance.clientBrowserTabEmitter.on('dialogs_update', (data) => {
      if (instance.dialogs === null) {
        const me = new Me({...instance.clientBrowserTabEmitter.me(), username});
        instance.dialogs = new DialogsCollection(me);
      }

      for (const receivedDialog of data) {
        instance.dialogs.addDialog(new Dialog(receivedDialog));
      }

      instance.emit('dialogs_update');
    });

    instance.clientBrowserTabEmitter.on('dialog_messages_update', (data) => {
      const dialog = instance.dialogs.getDialogByRemoteId(data.roomId);
      if (dialog.messages.loaded === false) {
        dialog.messages.collection = [];
      }

      for (const message of data.messages) {
        dialog.messages.addMessage(new Message(message));
      }

      dialog.messages.loaded = true;
      instance.emit('dialog_messages_update');
    });

    instance.clientBrowserTabEmitter.on('dialog_messages_new', (data) => {
      const dialog = instance.dialogs.getDialogByRemoteId(data.room);

      const messages = dialog.getMessages();
      messages.collection.find(message => '');

      dialog.messages.loaded = true;
      instance.emit('dialog_messages_update');
    });

    return instance;
  }

  getDialogs() {
    return this.dialogs;
  }

  getMessages(dialogId) {
    const dialog = this.dialogs.getDialogById(dialogId);

    if (dialog && dialog.getMessages().loaded === false) {
      this.clientBrowserTabEmitter.loadMessages(dialog.remoteId);
      return false;
    }

    return dialog.getMessages();
  }

  sendMessage(data) {
    const dialog = this.dialogs.getDialogById(data.dialogId);
    const messages = dialog.getMessages();
    const message = new Message(data.message);
    message.sent = false;

    messages.addMessage(message);
    this.clientBrowserTabEmitter.sendMessage(dialog.remoteId, message.text);
  }
}

export default Messenger;