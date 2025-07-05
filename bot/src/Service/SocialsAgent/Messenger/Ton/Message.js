import {v4 as uuid} from "uuid";

class Message {

  _messenger;
  _collection;

  browserDaemonEventEmitter;

  remote = {
    id: null,
    from: null,
    timestamp: null,
    text: null,
  }

  id;
  from;
  timestamp;
  text;
  attachments = [];

  constructor(browserDaemonEventEmitter, data) {
    this.browserDaemonEventEmitter = browserDaemonEventEmitter;

    this.id = uuid();

    if (data.id) {
      this.remote.id = data.id;
      this.remote.from = data.fromId;
      this.remote.timestamp = data.createdAt;
      this.remote.text = data.text;
    }
  }

  static create(_messenger, _collection, browserDaemonEventEmitter, data) {
    const instance = new this(browserDaemonEventEmitter, data);
    instance._messenger = _messenger;
    instance._collection = _collection;

    if (!instance.remote.id) {
      instance.browserDaemonEventEmitter.on('messageSent:' + instance._collection._dialog.member.remote.id, (data, _bag) => {
        if (_bag.messageId !== instance.id) {
          return;
        }

        instance.remote.id = data.id;
        instance.remote.from = data.fromId;
        instance.remote.timestamp = data.createdAt;
        instance.remote.text = data.text;

        instance.from = _messenger.me;
        instance.timestamp = instance.remote.timestamp;
        instance.text = instance.remote.text;

        // instance.browserDaemonEventEmitter.on('messageUpdate:' + instance.remote.id, () => {
        //   // @todo Logic.
        // });

        // @todo Remove messageSent listener.

        instance._messenger.emit('messageSent', instance);
      });

      instance.browserDaemonEventEmitter.sendMessage(instance._collection._dialog.member.remote.id, data.text, {
        messageId: instance.id
      });
    } else {
      if (instance.remote.from === _messenger.me.remote.id) {
        instance.from = _messenger.me;
      } else {
        instance.from = _collection._dialog.member;
      }

      instance.timestamp = instance.remote.timestamp;
      instance.text = instance.remote.text;

      // instance.browserDaemonEventEmitter.on('messageUpdate:' + instance.remote.id, () => {
      //   // @todo Logic.
      // });
    }

    return instance;
  }

}

export default Message;
