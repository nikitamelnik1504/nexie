import Me from "./Dialog/Me.js";
import DialogsCollection from "./Dialog/DialogsCollection.js";
import Dialog from "./Dialog/Dialog.js";
import Message from "./Dialog/Message.js";
import PlatformMessengerBase from "../PlatformMessengerBase.js";

/**
 * Central place where all messages related functionality located in.
 *
 * Here will be located cache, delayed messages and all custom functionality.
 */
class Messenger extends PlatformMessengerBase {

  static async init(clientBrowserTab, username) {
    const instance = new this();

    instance.clientBrowserTabEventEmitter = clientBrowserTab.getEventEmitter();

    instance.dialogs = new DialogsCollection();

    instance.clientBrowserTabEventEmitter.on('dialogs_update', (data) => {
      if (instance.dialogs === null) {
        const me = new Me({...instance.clientBrowserTabEventEmitter.me(), username});
        instance.dialogs = new DialogsCollection(me);
      }

      for (const receivedDialog of data) {
        instance.dialogs.addDialog(new Dialog(receivedDialog));
      }

      instance.emit('dialogs_list_loaded');
    });

    instance.clientBrowserTabEventEmitter.on('dialog_messages_update', (data) => {
      const dialog = instance.dialogs.getDialogByRemoteId(data.roomId);

      for (const message of data.messages) {
        dialog.messages.addMessage(new Message(message));
      }

      dialog.messages.loaded = true;
      instance.emit('dialog_messages_update');
    });

    instance.clientBrowserTabEventEmitter.on('dialog_message_new', (data) => {
      const dialog = instance.dialogs.getDialogByRemoteId(data.room);

      if (data.authorId !== instance.dialogs.me.id) {
        const message = new Message(data);
        dialog.messages.addMessage(message);
        instance.emit("dialog_message_new", message);
      } else {
        const message = dialog.getMessages().getFirstMatchedUnsentMessageByText(data.data.text);
        message.remoteId = data.id;
        message.timestamp = data.timestamp;
        message.edited = data.edited;

        // @todo Don't use object instances from Messenger/Dialog. Just JSON api needs to know. Or not?
        instance.emit('dialog_message_sent', message);
      }
    });

    return instance;
  }

  getDialogMessages(dialogId) {
    const dialog = this.dialogs.getDialogById(dialogId);

    if (dialog && dialog.getMessages().loaded === false) {
      this.clientBrowserTabEventEmitter.loadMessages(dialog.remoteId);
      return false;
    }

    return dialog.getMessages();
  }

  sendDialogMessage(data) {
    const dialog = this.dialogs.getDialogById(data.dialogId);
    const messages = dialog.getMessages();
    const message = new Message({...data.message, authorId: this.dialogs.me.id});

    messages.addMessage(message);
    this.clientBrowserTabEventEmitter.sendMessage(dialog.remoteId, message.text);
  }

  getDialogs() {
    return this.dialogs;
  }
}

export default Messenger;