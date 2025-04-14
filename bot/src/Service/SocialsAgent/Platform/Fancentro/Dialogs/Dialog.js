import MessagesCollection from "./MessagesCollection.js";
import Message from "./Message.js";
import Member from "./Member.js";

class Dialog {

  id;
  messages;
  member;

  constructor(data) {
    this.id = data.room._id;
    this.member = new Member(data);

    this.messages = new MessagesCollection();

    if (data.room.messages) {
      for (const message of data.room.messages) {
        this.messages.addMessage(new Message(message));
      }
    }
  }

}

export default Dialog;