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

  addAlbum(album) {
    this.collection.push(album);
    return album;
  }

}

export default AlbumsCollectionBase;