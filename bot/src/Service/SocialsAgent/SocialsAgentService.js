import { dolphinService } from "../../../index.js";

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
    return this.accounts.find(account => account.id === id);
  }

  async saveAccount(account) {
    const accountsData = JSON.parse(await fs.readFile(this.storagePath + '/socialAccounts.json', {'encoding': 'utf8'}));
    const match = accountsData.filter(item => item.id === account.id);
    if (match.length !== 0) {
      match[0] = account;
    } else {
      accountsData.push(account);
    }

    await fs.writeFile(this.storagePath + '/socialAccounts.json', JSON.stringify(accountsData),{'encoding': 'utf8'});
  }

  async addAccount(account) {
    this.accounts.push(account);
    await this.saveAccount(account);
  }

  async removeAccount(id) {
    this.accounts.splice(this.accounts.findIndex(account => account.id === id),1);
    const accountsData = JSON.parse(await fs.readFile(this.storagePath + '/socialAccounts.json', {'encoding': 'utf8'}));
    accountsData.splice(accountsData.findIndex(account => account.id === id), 1);
    await fs.writeFile(this.storagePath + '/socialAccounts.json', JSON.stringify(accountsData),{'encoding': 'utf8'});
  }

  getDolphinService() {
    return this.dolphinService;
  }

}

export default SocialsAgentService;