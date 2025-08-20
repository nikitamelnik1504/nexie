import VideoBase from "../../../lib/Messenger/VideoBase.js";

class Video extends VideoBase {

  remote = {
    id: null,
    src: null,
    duration: null,
  };

  duration;

  constructor(browserDaemonEventEmitter, data) {
    super(browserDaemonEventEmitter, data);

    if (data.elementId) {
      this.remote.id = data.elementId;
    } else if (data.videoId) {
      this.remote.id = data.videoId;
    }

    if (data.path) {
      const pathData = JSON.parse(data.path);
      this.remote.src = this.src = pathData[0].path;
    } else if (data.source) {
      const pathData = JSON.parse(data.source);
      this.remote.src = this.src = pathData[0].path;
    }

    if (data.videoExtra && data.videoExtra.duration) {
      this.remote.duration = this.duration = data.videoExtra.duration;
    }
  }

}

export default Video;