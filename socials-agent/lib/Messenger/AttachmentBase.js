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

    // @todo Checked not all albums.
    if (_message.from.id === _messenger.me.id) {
      if (data.id) {
        for (const album of instance._messenger.getAlbums().list()) {
          for (const albumItem of album.getItems().list()) {
            if (albumItem.getMedia().id.toString() === data.id) {
              instance.media = albumItem.getMedia();
            }
          }
        }
      }

      // @todo Temporary.
      if (!instance.media) {
        instance.media = instance._messenger.getFactory().createMedia(data.type, data);
      }
    } else {
      instance.media = instance._messenger.getFactory().createMedia(data.type, data);
    }

    return instance;
  }

  getMedia() {
    return this.media;
  }

}

export default AttachmentBase;