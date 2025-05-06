import DolphinService from "./Dolphin/DolphinService.js";

class ClientManager {

  dolphinService = null;

  constructor(dolphinService) {
    this.dolphinService = dolphinService;
  }

  static init() {
    return new this(new DolphinService());
  }

  async getDolphinClient(apiUrl, authToken) {
    return this.dolphinService.client(apiUrl, authToken);
  }

}

export default ClientManager;
