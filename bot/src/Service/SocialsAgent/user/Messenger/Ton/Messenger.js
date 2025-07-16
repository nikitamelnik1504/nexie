import MessengerBase from "../../../lib/MessengerBase.js";
import MessengerFactory from "./MessengerFactory.js";

class Messenger extends MessengerBase {

  async start() {
    await super.start();

    this.factory = new MessengerFactory(this, this.daemon.getEventEmitter());
    this.me = this.factory.createMe(this.daemon.getEventEmitter().getMe());
    this.albums = this.factory.createAlbumsCollection();
    this.dialogs = this.factory.createDialogsCollection();

    const browserDaemonEventEmitter = this.daemon.getEventEmitter();
    // Can be very proactive. `dialogsUpdate:<username>`
    browserDaemonEventEmitter.on('dialogsList', (data) => {
      for (const dialog of data) {
        this.getDialogs().addDialog(this.getFactory().createDialog(this, dialog));
      }

      // const matchedDialogIndex = instance.collection.findIndex((existDialog) => existDialog.id === dialog.id);

      this.emit('dialogsList', this.dialogs.collection); // @todo Replace with actually added.
    });

    browserDaemonEventEmitter.on('dialogUpdate', (data) => {
      // @todo Logic.
    });

    browserDaemonEventEmitter.on('messagesList', (data) => {
      let currentDialog;

      for (const dialog of this.getDialogs().list()) {
        if (dialog.member.remote.id === data.memberId) {
          currentDialog = dialog;
        }
      }

      currentDialog.getMessages().synced = true;

      for (const message of data.data) {
        currentDialog.getMessages().addMessage(this.getFactory().createMessage(currentDialog.getMessages(), message));
      }

      this.emit('messagesList', currentDialog.getMessages().collection); // @todo Replace with actually added.
    })

    browserDaemonEventEmitter.on('messageNew', (data) => {
      // let currentDialog;

      // for (const dialog of this.getDialogs().list()) {
      //   if (dialog.member.remote.id === data.memberId) {
      //     currentDialog = dialog;
      //   }
      // }

      // instance._dialog.member.remote.id
      // const message = this.getFactory().createMessage(currentDialog.getMessages(), data);
      // currentDialog.getMessages().addMessage(message);

      // this.emit('messageNew', currentDialog.getMessages().message(message.id));
    });

    return this;
  }

}

export default Messenger;