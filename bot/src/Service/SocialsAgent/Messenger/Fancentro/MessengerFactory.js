import DialogsCollection from "./DialogsCollection.js";
import Me from "./Me.js";
import Dialog from "./Dialog.js";
import MessagesCollection from "./MessagesCollection.js";
import Message from "./Message.js";
import Member from "./Member.js";

class MessengerFactory {

  constructor(messenger, browserDaemonEventEmitter) {
    this.messenger = messenger;
    this.browserDaemonEventEmitter = browserDaemonEventEmitter;
  }

  createMe(data) {
    return Me.create(this.messenger, this.browserDaemonEventEmitter, data);
  }

  createMember(_dialog, data) {
    return Member.create(this.messenger, _dialog, this.browserDaemonEventEmitter, data);
  }

  createDialogsCollection() {
    return DialogsCollection.create(this.messenger, this.browserDaemonEventEmitter);
  }

  createDialog(_collection, data) {
    return Dialog.create(this.messenger, _collection, this.browserDaemonEventEmitter, data);
  }

  createMessagesCollection(_dialog) {
    return MessagesCollection.create(this.messenger, _dialog, this.browserDaemonEventEmitter);
  }

  createMessage(_collection, data) {
    return Message.create(this.messenger, _collection, this.browserDaemonEventEmitter, data);
  }
}

export default MessengerFactory;