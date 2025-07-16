import ImageBase from "../../../lib/Messenger/ImageBase.js";

class Image extends ImageBase {

  remote = {
    id: null,
    src: null,
  };

  constructor(browserDaemonEventEmitter, data) {
    super(browserDaemonEventEmitter, data);

    // @todo Replace that shit.
    // If it builds from album item.
    if (data.elementId) {
      this.remote.id = data.elementId;
    }
    // If it builds from attachment.
    else if (data.photoId) {
      this.remote.id = data.photoId;
    }

    // If it builds from album item.
    if (data.path) {
      this.remote.src = this.src = data.path;
    }
    // @todo Security vulnerability.
    else if (data.src) {
      this.remote.src = this.src = data.src;
    }
    // If it builds from attachment.
    else if (data.photoLarge) {
      this.remote.src = this.src = data.photoLarge;
    }
  }
}

export default Image;
