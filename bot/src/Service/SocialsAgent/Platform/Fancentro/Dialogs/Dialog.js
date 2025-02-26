import MessagesCollection from "./MessagesCollection.js";
import Message from "./Message.js";

class Dialog {

  id;
  messages;

  constructor(data) {
    this.id = data.room._id;

    this.messages = new MessagesCollection();

    if (data.room.messages) {
      for (const message of data.room.messages) {
        this.messages.addMessage(new Message(message));
      }
    }
  }

}

export default Dialog;