class MediasCollectionBase {

    _messenger;

    _album = null;

    browserDaemonEventEmitter;

    collection = [];

    constructor(browserDaemonEventEmitter) {
        this.browserDaemonEventEmitter = browserDaemonEventEmitter;
    }

    static create(_messenger, _album, browserDaemonEventEmitter) {
        const instance = new this(browserDaemonEventEmitter);
        instance._messenger = _messenger;
        instance._album = _album;

        instance.browserDaemonEventEmitter.on('albumMediasList:' + instance._album.remote.id, (data) => {
          for (const media of data) {
            instance.addMedia(instance._messenger.getFactory().createMedia(media, instance));
          }

          instance._messenger.emit('albumMediasList', instance.collection);
        });

        return instance;
    }

    list(offset = 0, limit = 30) {
      const availableItems = this.collection.slice(offset);
      const itemsToReturn = availableItems.slice(0, limit);

      if (itemsToReturn.length < limit) {
        const remainingMedias = limit - itemsToReturn.length;
        this.browserDaemonEventEmitter.requestMedia(this._album.remote.id, remainingMedias);
      }

      return itemsToReturn;
    }

    addMedia(media) {
      this.collection.push(media)
      return media;
    }
}

export default MediasCollectionBase;