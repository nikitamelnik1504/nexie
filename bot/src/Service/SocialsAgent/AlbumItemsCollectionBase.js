class AlbumItemsCollectionBase {

  _messenger;

  _album = null;

  collection = [];

  browserDaemonEventEmitter;

  constructor(browserDaemonEventEmitter) {
    this.browserDaemonEventEmitter = browserDaemonEventEmitter;
  }

  static create(_messenger, _album = null, browserDaemonEventEmitter) {
    const instance = new this(browserDaemonEventEmitter);
    instance._messenger = _messenger;
    instance._album = _album;

    instance.browserDaemonEventEmitter.on('albumMediasList:' + instance._album.remote.id, (data) => {
      for (const albumItem of data) {
        instance.addItem(instance._messenger.getFactory().createAlbumItem(instance, albumItem));
      }

      instance._messenger.emit('albumMediasList', instance.collection);
    });

    return instance;
  }

  list(offset = 0, limit = 30) {
    const availableItems = this.collection.slice(offset);
    const itemsToReturn = availableItems.slice(0, limit);

    if (itemsToReturn.length < limit) {
      const remainingItems = limit - itemsToReturn.length;
      this.browserDaemonEventEmitter.requestMedia(this._album.remote.id, remainingItems);
    }

    return itemsToReturn;
  }

  addItem(albumItem) {
    this.collection.push(albumItem)
    return albumItem;
  }

}

export default AlbumItemsCollectionBase;