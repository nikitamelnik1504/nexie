class AlbumsCollectionBase {

  _messenger;

  browserDaemonEventEmitter;

  collection = [];

  constructor(browserDaemonEventEmitter) {
    this.browserDaemonEventEmitter = browserDaemonEventEmitter;
  }

  static create(_messenger, browserDaemonEventEmitter) {
    const instance = new this(browserDaemonEventEmitter);
    instance._messenger = _messenger;

    instance.browserDaemonEventEmitter.on('albumsList', (data) => {
      for (const album of data) {
        instance.addAlbum(_messenger.getFactory().createAlbum(instance, album));
      }

      // const matchedDialogIndex = instance.collection.findIndex((existDialog) => existDialog.id === dialog.id);

      instance._messenger.emit('albumsList', instance.collection); // @todo Replace with actually added.
    });

    return instance;
  }

  list(offset = 0, limit = 30) {
    const availableItems = this.collection.slice(offset);
    const itemsToReturn = availableItems.slice(0, limit);

    if (itemsToReturn.length < limit) {
      const remainingDialogs = limit - itemsToReturn.length;
      this.browserDaemonEventEmitter.requestAlbums(remainingDialogs);
    }

    return itemsToReturn;
  }

  addAlbum(album) {
    this.collection.push(album);
    return album;
  }

  album(id) {
    return this.collection.find(album => album.id === id);
  }

}

export default AlbumsCollectionBase;