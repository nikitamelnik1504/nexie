import DolphinService from "./Client/Dolphin/DolphinService.js";

class ClientManager {

  dolphinService = null;

  constructor(dolphinService) {
    this.dolphinService = dolphinService;
  }

  static init() {
    return new this(new DolphinService());
  }

  async get(clientType, clientSettings) {
    if (clientType === 'dolphin') {
      return this.dolphinService.client(clientSettings.apiUrl, clientSettings.authToken);
    }
  }

}

export default ClientManager;
