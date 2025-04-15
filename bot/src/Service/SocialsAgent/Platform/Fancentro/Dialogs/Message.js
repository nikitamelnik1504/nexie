import {v4 as uuid} from 'uuid';

class Message {

  id;
  remoteId = null;
  timestamp = null;
  text = null;
  edited = null;
  from = null;

  constructor(data) {
    this.id = uuid();

    if (data.type === 'text') {
      this.text = data.data.text;
    }
    if (data.id !== undefined) {
      this.remoteId = data.id;
    }
    if (data.edited !== undefined) {
      this.edited = data.edited;
    }
    if (data.timestamp !== undefined) {
      this.timestamp = data.timestamp;
    }
    if (data.authorId !== undefined) {
      this.from = data.authorId;
    }
  }

}

export default Message;