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

  async addAccount(data) {
    return await fetch(this.#apiUrl + `/accounts`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(async (response) => await response.json());
  }

  async removeAccount(id) {
    return await fetch(this.#apiUrl + `/accounts/${id}`, {method: 'DELETE'});
  }

  async getClients() {
    return await fetch(this.#apiUrl + `/clients`).then(async (response) => await response.json());
  }

  async getClientProfiles(clientType, params) {
    const query = new URLSearchParams(params).toString();

    return await fetch(this.#apiUrl + `/clients/${clientType}/profiles?${query}`).then(async (response) => await response.json());
  }

}