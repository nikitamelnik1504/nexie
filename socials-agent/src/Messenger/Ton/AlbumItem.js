import AlbumItemBase from "../../../lib/Messenger/AlbumItemBase.js";

class AlbumItem extends AlbumItemBase {

  remote = {
    timestamp: null,
  };

  constructor(browserDaemonEventEmitter, data) {
    super(browserDaemonEventEmitter, data);

    if (data.createdAt) {
      this.remote.timestamp = this.timestamp = data.createdAt;
    }
  }

}

export default AlbumItem