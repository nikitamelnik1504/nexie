export default class SocialsAgentService {

  #apiUrl;

  constructor(apiUrl) {
    this.#apiUrl = apiUrl;
  }

  async startMessenger(accountId) {
    return await fetch(this.#apiUrl + `/accounts/${accountId}/messenger/start`, {
      method: 'POST'
    });
  }

  stopMessenger(accountId) {
  }

  async getAccounts() {
    return await fetch(this.#apiUrl + '/accounts').then(async (response) => await response.json());
  }

  async getAccount(id) {
    return await fetch(this.#apiUrl + `/accounts/${id}`).then(async (response) => await response.json());
  }

  addAccount() {
  }

  removeAccount(id) {
  }

  getClientProfiles(clientType, params) {
  }

}