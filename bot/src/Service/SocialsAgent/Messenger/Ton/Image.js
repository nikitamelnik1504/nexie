import ImageBase from "../../ImageBase.js";

class Image extends ImageBase {

  remote = {
    id: null,
    timestamp: null,
    src: null,
  };

  constructor(browserDaemonEventEmitter, data) {
    super(browserDaemonEventEmitter, data);

    if (data.id) {
      this.remote.id = data.id;
    }
    if (data.createdAt) {
      this.remote.timestamp = this.timestamp = data.createdAt;
    }
    if (data.path) {
      this.remote.src = this.src = data.path;
    }
  }
}

export default Image;
