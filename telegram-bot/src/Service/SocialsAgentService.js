export default class SocialsAgentService {

  #apiUrl;

  constructor(apiUrl) {
    this.#apiUrl = apiUrl;
  }

  startMessenger(accountId) {
  }

  stopMessenger(accountId) {
  }

  async getAccounts() {
    return await fetch(this.#apiUrl + '/accounts').then(async (response) => await response.json());
  }

  addAccount() {
  }

  removeAccount(id) {
  }

  getClientProfiles(clientType, params) {
  }

}