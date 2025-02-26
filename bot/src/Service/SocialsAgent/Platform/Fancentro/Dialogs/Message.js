class Message {

  id = null;
  timestamp = null;
  text = null;
  edited = null;
  from = null;

  constructor(data) {
    if (data.type === 'text') {
      this.text = data.data.text;
    }
    if (data.id !== undefined) {
      this.id = data.id;
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

  toJSON() {
    return JSON.stringify({});
  }

}

export default Message;