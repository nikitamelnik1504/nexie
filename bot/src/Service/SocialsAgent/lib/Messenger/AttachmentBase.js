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

    // @todo Checked not all albums.
    for (const album of instance._messenger.getAlbums().list(0, 30)) {
      for (const albumItem of album.getItems().list(0, 30)) {
        if (albumItem.getMedia().id.toString() === data.id.toString()) {
          instance.media = albumItem.getMedia();
        }
      }
    }

    if (!instance.media) {
      instance.media = instance._messenger.getFactory().createMedia(data.type, data);
    }

    return instance;
  }

  getMedia() {
    return this.media;
  }

}

export default AttachmentBase;