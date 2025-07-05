import AlbumBase from "../../AlbumBase.js";

class Album extends AlbumBase {

  remote = {
    id: null,
    title: null,
    coverUrl: null,
    timestamp: null
  }

  title;
  coverUrl;
  timestamp;

  constructor(browserDaemonEventEmitter, data) {
    super(browserDaemonEventEmitter, data);
    if (data.title) {
      this.title = this.remote.title = data.title;
    }
    if (data.coverUrl) {
      this.coverUrl = this.remote.coverUrl = data.coverUrl;
    } else {
      this.coverUrl = null;
    }
    if (data.createdAt) {
      this.timestamp = this.remote.timestamp = data.createdAt;
    }
    if (data.id) {
      this.remote.id = data.id;
    }
  }
}

export default Album;