import {v4 as uuid} from "uuid";

class AttachmentBase {

  _messenger;
  _message;

  browserDaemonEventEmitter;

  remote = {};

  media;

  id;

  constructor(browserDaemonEventEmitter, data) {
    this.browserDaemonEventEmitter = browserDaemonEventEmitter;

    this.id = uuid();
  }

  static create(_messenger, _message, browserDaemonEventEmitter, data) {
    const instance = new this(browserDaemonEventEmitter, data);
    instance._messenger = _messenger;
    instance._message = _message;

    // @todo Hardcoded photo.
    instance.media = instance._messenger.getFactory().createMedia(data.type, data);

    return instance;
  }

  getMedia() {
    return this.media;
  }

}

export default AttachmentBase;