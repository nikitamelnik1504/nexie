import VideoBase from "../../VideoBase.js";

class Video extends VideoBase {

  remote = {
    id: null,
    timestamp: null,
    src: null,
    duration: null,
  };

  duration;

  constructor(browserDaemonEventEmitter, data) {
    super(browserDaemonEventEmitter, data);

    if (data.id) {
      this.remote.id = data.id;
    }
    if (data.createdAt) {
      this.remote.timestamp = this.timestamp = data.createdAt;
    }
    if (data.path) {
      const pathData = JSON.parse(data.path);
      this.remote.src = this.src = pathData[0].path;
    }
    if (data.videoExtra && data.videoExtra.duration) {
      this.remote.duration = this.duration = data.videoExtra.duration;
    }
  }

}

export default Video;