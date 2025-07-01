import AlbumsCollectionBase from "../../AlbumsCollectionBase.js";

class AlbumsCollection extends AlbumsCollectionBase {

  constructor(browserDaemonEventEmitter) {
    super();
    this.browserDaemonEventEmitter = browserDaemonEventEmitter;

  }
  
  static create(_messenger, browserDaemonEventEmitter) {

  }

}

export default AlbumsCollection;