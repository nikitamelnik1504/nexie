class AlbumsCollectionBase {

  _messenger;

  browserDaemonEventEmitter;

  collection = [];

  addAlbum(album) {
    this.collection.push(album);
    return album;
  }

}

export default AlbumsCollectionBase;