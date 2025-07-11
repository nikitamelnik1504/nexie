import {v4 as uuid} from 'uuid';

class AlbumBase {

  _messenger;
  _collection;

  browserDaemonEventEmitter;

  remote = {};

  id = null;

  items;

  constructor(browserDaemonEventEmitter, data) {
    this.browserDaemonEventEmitter = browserDaemonEventEmitter;

    this.id = uuid();
  }

  static create(_messenger, _collection, browserDaemonEventEmitter, data) {
    const instance = new this(browserDaemonEventEmitter, data);
    instance._messenger = _messenger;
    instance._collection = _collection;

    instance.items = instance._messenger.getFactory().createAlbumItemsCollection(instance);

    return instance;
  }

  getItems() {
    return this.items;
  }

}

export default AlbumBase;