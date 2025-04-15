import {v4 as uuid} from 'uuid';
import MessagesCollection from "./MessagesCollection.js";
import Message from "./Message.js";
import Member from "./Member.js";

class Dialog {

  id;
  remoteId;
  messages;
  member;

  constructor(data) {
    this.id = uuid();
    this.remoteId = data.room._id;
    this.member = new Member(data);

    this.messages = new MessagesCollection();

    if (data.room.messages) {
      for (const message of data.room.messages) {
        // @todo stupid shit. Replace in watcher.
        if (message === null) {
          continue;
        }

        this.messages.addMessage(new Message(message));
      }
    }
  }

  getMessages() {
    return this.messages;
  }

}

export default Dialog;