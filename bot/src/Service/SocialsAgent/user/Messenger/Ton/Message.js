import ImageAttachment from "./ImageAttachment.js";
import MessageBase from "../../../lib/Messenger/MessageBase.js";

class Message extends MessageBase {

  remote = {
    id: null,
    from: null,
    timestamp: null,
    text: null,
  }

  from;
  timestamp;
  text;

  attachments = [];

  constructor(_messenger, _collection, browserDaemonEventEmitter, data) {
    super(_messenger, _collection, browserDaemonEventEmitter, data);

    if (data.id) {
      this.remote.id = data.id;
      this.remote.from = data.fromId;
      this.remote.timestamp = data.createdAt;
      this.remote.text = data.text;

      this.from = this.remote.from === this._messenger.me.remote.id ? this._messenger.getMe() : this._collection._dialog.member;
      this.timestamp = this.remote.timestamp;
      this.text = this.remote.text;

      if (data.attachments && data.attachments.length > 0) {
        for (const attachment of data.attachments) {
          this.attachments.push(this._messenger.getFactory().createAttachment(this, attachment));
        }
      }
    } else {
      this.from = this._messenger.getMe();
      this.text = data.text;

      if (data.attachments && data.attachments.length > 0) {
        for (const attachment of data.attachments) {
          this.attachments.push(this._messenger.getFactory().createAttachment(this, attachment));
        }
      }

      const attachmentsForDaemon = [];
      for (const attachment of this.attachments) {
        if (attachment instanceof ImageAttachment) {
          attachmentsForDaemon.push({type: 'photo',
            photo: {
              photoId: attachment.getMedia().remote.id
            }});
        }
      }
      this.browserDaemonEventEmitter.sendMessage(this._collection._dialog.member.remote.id, this.text, attachmentsForDaemon, {
        messageId: this.id
      });
    }
  }
}

export default Message;
