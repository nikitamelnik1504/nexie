import DolphinService from "./Client/Dolphin/DolphinService.js";
import SystemService from "./Client/System/SystemService.js";

class ClientManager {

  dolphinService = null;
  systemService = null;

  constructor(dolphinService, systemService) {
    this.dolphinService = dolphinService;
    this.systemService = systemService;
  }

  static init() {
    return new this(new DolphinService(), new SystemService());
  }

  async get(clientType, clientSettings) {
    if (clientType === 'dolphin') {
      return this.dolphinService.client(clientSettings.apiUrl, clientSettings.authToken);
    }
    if (clientType === 'system') {
      return this.systemService.client();
    }
  }

}

export default ClientManager;
