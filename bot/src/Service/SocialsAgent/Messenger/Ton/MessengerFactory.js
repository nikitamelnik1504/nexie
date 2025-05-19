import DialogsCollection from "./DialogsCollection.js";
import Me from "./Me.js";
import Dialog from "./Dialog.js";
import MessagesCollection from "./MessagesCollection.js";
import Message from "./Message.js";
import Member from "./Member.js";

class MessengerFactory {

  constructor(messenger, clientBrowserDaemonEventEmitter) {
    this.messenger = messenger;
    this.clientBrowserDaemonEventEmitter = clientBrowserDaemonEventEmitter;
  }

  createMe(data) {
    return Me.create(this.messenger, this.clientBrowserDaemonEventEmitter, data);
  }

  createMember(_dialog, data) {
    return Member.create(this.messenger, _dialog, this.clientBrowserDaemonEventEmitter, data);
  }

  createDialogsCollection() {
    return DialogsCollection.create(this.messenger, this.clientBrowserDaemonEventEmitter);
  }

  createDialog(_collection, data) {
    return Dialog.create(this.messenger, _collection, this.clientBrowserDaemonEventEmitter, data);
  }

  createMessagesCollection(_dialog) {
    return MessagesCollection.create(this.messenger, _dialog, this.clientBrowserDaemonEventEmitter);
  }

  createMessage(_collection, data) {
    return Message.create(this.messenger, _collection, this.clientBrowserDaemonEventEmitter, data);
  }
}

export default MessengerFactory;