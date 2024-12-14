import {dolphinService} from "../../../index.js";

import fs from "fs/promises";
import SocialsAgentFactory from "./SocialsAgentFactory.js";

class SocialsAgentService {

  storagePath;

  dolphinService;

  factory;

  accounts = [];

  static async init(storagePath) {
    const instance = new this();

    instance.factory = new SocialsAgentFactory(instance);

    instance.storagePath = storagePath;

    instance.dolphinService = dolphinService;

    const accountsData = JSON.parse(await fs.readFile(instance.storagePath + '/socialAccounts.json', {'encoding': 'utf8'}));

    for (const accountData of accountsData) {
      const account = instance.factory.createAccount(accountData);
      instance.accounts.push(account);
    }

    return instance;
  }

  getFactory() {
    return this.factory;
  }

  getAccounts() {
    return this.accounts;
  }

  getAccount(id) {
    return this.accounts.find(account => account.id === id) || false;
  }

  async saveAccount(account) {
    const accountsData = JSON.parse(await fs.readFile(this.storagePath + '/socialAccounts.json', { encoding: 'utf8' }));

    const accountIndex = accountsData.findIndex(item => item.id === account.id);

    if (accountIndex !== -1) {
      accountsData[accountIndex] = account.toJSON();
    } else {
      accountsData.push(account.toJSON());
    }
    await fs.writeFile(this.storagePath + '/socialAccounts.json', JSON.stringify(accountsData), { encoding: 'utf8' });
  }

  async addAccount(account) {
    if (this.getAccount(account.id)) {
      throw new Error('Account is already exist');
    }

    for (const existAccount of this.getAccounts()) {
      const existAccountClientParams = existAccount.getClientParams();
      const newAccountClientParams = account.getClientParams();

      switch (account.getClientType()) {
        case 'dolphin':
          // Check if account with specified client, client profile and platform exist.
          if (
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

    this.accounts.push(account);
    await this.saveAccount(account);
  }

  async removeAccount(id) {
    const accountIndex= this.accounts.findIndex(account => account.id === id);
    if (accountIndex === -1) {
      throw new Error('Account not found.');
    }

    this.accounts.splice(accountIndex, 1);
    const accountsData = JSON.parse(await fs.readFile(this.storagePath + '/socialAccounts.json', {'encoding': 'utf8'}));
    accountsData.splice(accountsData.findIndex(account => account.id === id), 1);
    await fs.writeFile(this.storagePath + '/socialAccounts.json', JSON.stringify(accountsData), {'encoding': 'utf8'});
  }

  getDolphinService() {
    return this.dolphinService;
  }

}

export default SocialsAgentService;