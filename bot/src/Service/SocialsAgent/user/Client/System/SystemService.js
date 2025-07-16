import SystemClient from "./SystemClient.js";

class SystemService {

  async client() {
    return await SystemClient.connect();
  }

}

export default SystemService;
