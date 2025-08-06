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
    browserDaemonEventEmitter.on('dialogsList', (data) => {
      for (const dialog of data) {
        this.getDialogs().addDialog(this.getFactory().createDialog(this.getDialogs(), dialog));
      }

      // const matchedDialogIndex = instance.collection.findIndex((existDialog) => existDialog.id === dialog.id);

      this.emit('dialogsList', this.dialogs.collection); // @todo Replace with actually added.
    });

    // Can be very proactive. `dialogsUpdate:<username>`
    // @todo browserDaemonEventEmitter.on('dialogUpdate', (data) => {});

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

    browserDaemonEventEmitter.on('messageSent', (data, _bag) => {
      let currentDialog, currentMessage;

      for (const dialog of this.getDialogs().list()) {
        if (dialog.member.remote.id === data.memberId) {
          currentDialog = dialog;
        }
      }

      for (const message of currentDialog.getMessages().list()) {
        if (message.id === _bag.messageId) {
          currentMessage = message;
        }
      }

      currentMessage.remote.id = data.id;
      currentMessage.remote.from = data.fromId;
      currentMessage.remote.timestamp = data.createdAt;
      currentMessage.remote.text = data.text;
      currentMessage.remote.price.value = data.price;
      currentMessage.remote.price.currency = data.currency;
      currentMessage.remote.price.paid = !data.isHidden;
      currentMessage.timestamp = currentMessage.remote.timestamp;
      currentMessage.text = currentMessage.remote.text;

      // @todo Remove messageSent listener.
      this.emit('messageSent', currentMessage);
    });

    // @todo browserDaemonEventEmitter.on('messageUpdate:' + instance.remote.id, () => {});

    browserDaemonEventEmitter.on('messageNew', (data) => {
      let currentDialog;

      for (const dialog of this.getDialogs().list()) {
        if (dialog.member.remote.id === data.memberId) {
          currentDialog = dialog;
        }
      }

      const message = this.getFactory().createMessage(currentDialog.getMessages(), data);
      currentDialog.getMessages().addMessage(message);

      this.emit('messageNew', currentDialog.getMessages().message(message.id));
    });

    browserDaemonEventEmitter.on('albumsList', (data) => {
      for (const album of data) {
        this.albums.addAlbum(this.getFactory().createAlbum(this.albums, album));
      }

      // const matchedDialogIndex = instance.collection.findIndex((existDialog) => existDialog.id === dialog.id);

      this.emit('albumsList', this.albums.collection); // @todo Replace with actually added.
    });

    browserDaemonEventEmitter.on('albumMediasList', (data) => {
      let currentAlbum;

      for (const album of this.albums.list()) {
        if (album.remote.id === data.albumId) {
          currentAlbum = album;
        }
      }

      for (const albumItem of data.data) {
        currentAlbum.getItems().addItem(this.getFactory().createAlbumItem(currentAlbum.getItems(), albumItem));
      }

      this.emit('albumMediasList', currentAlbum.getItems().collection);
    });

    return this;
  }

}

export default Messenger;