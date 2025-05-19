import AccountFactory from "./AccountFactory.js";
import ClientManager from "./ClientManager.js";
import BrowserManager from "./BrowserManager.js";
import AccountStorage from "./AccountStorage.js";

class Service {

  #storage;
  #clientManager;
  #browserManager;
  #factory;
  #accounts = [];

  static async init(storagePath) {
    const instance = new this();

    instance.#factory = new AccountFactory(instance);
    instance.#storage = new AccountStorage(storagePath);

    instance.#clientManager = ClientManager.init();
    instance.#browserManager = new BrowserManager();

    for (const accountData of await instance.#storage.getAll()) {
      const account = instance.#factory.createAccount(accountData);
      instance.#accounts.push(account);
    }

    return instance;
  }

  getFactory() {
    return this.#factory;
  }

  getAccounts() {
    return this.#accounts;
  }

  getAccount(id) {
    return this.#accounts.find(account => account.id === id) || false;
  }

  async addAccount(account) {
    if (this.getAccount(account.id)) {
      throw new Error('Account is already exist');
    }

    await this.validateAccount(account);
    this.#accounts.push(account);

    if (await this.#storage.get(account.id) === null) {
      await this.#storage.add(account.toJSON());
    } else {
      await this.#storage.update(account.id, account.toJSON());
    }
  }

  async validateAccount(account) {
    for (const existAccount of this.getAccounts()) {
      const existAccountClientParams = existAccount.getClientParams();
      const newAccountClientParams = account.getClientParams();

      switch (account.getClientType()) {
        case 'dolphin':
          // Check if account with specified client, client profile and platform exist.
          if (
            existAccount.id !== account.id &&
            'dolphin' === existAccount.getClientType() &&
            newAccountClientParams.apiUrl === existAccountClientParams.apiUrl &&
            newAccountClientParams.authToken === existAccountClientParams.authToken &&
            +newAccountClientParams.profile === +existAccountClientParams.profile &&
            account.getPlatformType() === existAccount.getPlatformType()
          ) {
            throw new Error('Account with specified client, platform and profile is already exist.');
          }

          // Check if account with specified client, platform and username exist.
          if (
            existAccount.id !== account.id &&
            'dolphin' === existAccount.getClientType() &&
            newAccountClientParams.apiUrl === existAccountClientParams.apiUrl &&
            newAccountClientParams.authToken === existAccountClientParams.authToken &&
            account.getPlatformType() === existAccount.getPlatformType() &&
            account.getPlatformUsername() === existAccount.getPlatformUsername()) {
            throw new Error('Account with specified client, platform and username already exist.');
          }
          break;
      }
    }
  }

  async removeAccount(id) {
    const accountIndex = this.#accounts.findIndex(account => account.id === id);
    if (accountIndex === -1) {
      throw new Error('Account not found.');
    }

    this.#accounts.splice(accountIndex, 1);
    await this.#storage.remove(id);
  }

  getClientManager() {
    return this.#clientManager;
  }

  getBrowserManager() {
    return this.#browserManager;
  }

}

export default Service;