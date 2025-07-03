import SystemProfile from "./SystemProfile.js";

class SystemClient {

  static async connect() {
    return new this();
  }

  async profile() {
    const profileInstance = new SystemProfile(this);
    return profileInstance.refresh();
  }
}

export default SystemClient;