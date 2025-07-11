class AlbumItemBase {

  _messenger;
  _collection;

  remote = {};

  browserDaemonEventEmitter;

  media;

  timestamp;

  constructor(browserDaemonEventEmitter, data) {
    this.browserDaemonEventEmitter = browserDaemonEventEmitter;
  }

  static create(_messenger, _collection, browserDaemonEventEmitter, data) {
    const instance = new this(browserDaemonEventEmitter, data);

    instance._messenger = _messenger;
    instance._collection = _collection;

    instance.media = instance._messenger.getFactory().createMedia(data.elementType, data);

    return instance;
  }

  getMedia() {
    return this.media;
  }

}

export default AlbumItemBase;