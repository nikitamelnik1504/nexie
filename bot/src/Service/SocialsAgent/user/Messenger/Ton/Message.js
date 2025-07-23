import ImageAttachment from "./ImageAttachment.js";
import MessageBase from "../../../lib/Messenger/MessageBase.js";

class Message extends MessageBase {

  remote = {
    id: null,
    from: null,
    timestamp: null,
    text: null,
    price: {
      currency: null,
      paid: null,
      value: null,
    },
  }

  from;
  timestamp;
  text;
  price = null;

  attachments = [];

  constructor(_messenger, _collection, browserDaemonEventEmitter, data) {
    super(_messenger, _collection, browserDaemonEventEmitter, data);

    if (data.id) {
      this.remote.id = data.id;
      this.remote.from = data.fromId;
      this.remote.timestamp = data.createdAt;
      this.remote.text = data.text;
      this.remote.price.value = data.price;
      this.remote.price.currency = data.currency;
      this.remote.price.paid = !data.isHidden;

      this.from = this.remote.from === this._messenger.me.remote.id ? this._messenger.getMe() : this._collection._dialog.member;
      this.timestamp = this.remote.timestamp;
      this.text = this.remote.text;
      if (this.remote.price.value && this.remote.price.value.toString() !== '0') {
        this.price = {
          value: this.remote.price.value,
          currency: this.remote.price.currency,
          paid: this.remote.price.paid
        };
      }

      if (data.attachments && data.attachments.length > 0) {
        for (const attachment of data.attachments) {
          this.attachments.push(this._messenger.getFactory().createAttachment(this, attachment));
        }
      }
    } else {
      this.from = this._messenger.getMe();
      this.text = data.text;

      if (data.price && data.currency) {
        this.price = {
          value: data.price,
          paid: false,
          currency: data.currency
        };
      }

      if (data.attachments && data.attachments.length > 0) {
        for (const attachment of data.attachments) {
          this.attachments.push(this._messenger.getFactory().createAttachment(this, attachment));
        }
      }

      const attachmentsForDaemon = [];
      for (const attachment of this.attachments) {
        if (attachment instanceof ImageAttachment) {
          attachmentsForDaemon.push({
            type: 'photo',
            photo: {
              photoId: attachment.getMedia().remote.id
            }
          });
        }
      }

      const charge = this.price ? {price: this.price.value, currency: this.price.currency} : {};

      this.browserDaemonEventEmitter.sendMessage(this._collection._dialog.member.remote.id, this.text, attachmentsForDaemon, charge, {
        messageId: this.id
      });
    }
  }
}

export default Message;
