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

  async stopMessenger(accountId) {
    return await fetch(this.#apiUrl + `/accounts/${accountId}/messenger/stop`, {
      method: 'POST'
    });
  }

  async getAccounts() {
    return await fetch(this.#apiUrl + '/accounts').then(async (response) => await response.json());
  }

  async getAccount(id) {
    return await fetch(this.#apiUrl + `/accounts/${id}`).then(async (response) => await response.json());
  }

  async addAccount() {
  }

  async removeAccount(id) {
    return await fetch(this.#apiUrl + `/accounts/${id}`, {method: 'DELETE'});
  }

  getClientProfiles(clientType, params) {
  }

}