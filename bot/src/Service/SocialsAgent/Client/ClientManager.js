import DolphinService from "./Dolphin/DolphinService.js";

class ClientManager {

  dolphinService = null;

  constructor(dolphinService) {
    this.dolphinService = dolphinService;
  }

  static init() {
    return new ClientManager(new DolphinService());
  }

  getDolphinService() {
    return this.dolphinService;
  }

}

export default ClientManager;
