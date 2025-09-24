import fs from "fs/promises";

class AccountStorage {

  #filePath;

  constructor(filePath) {
    this.#filePath = filePath;
  }

  async getAll() {
    const storageFilePath = this.#filePath + '/socialAccounts.json';

    try {
      await fs.access(storageFilePath);

      return JSON.parse(await fs.readFile(storageFilePath, {encoding: 'utf8'}));
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.writeFile(storageFilePath, JSON.stringify([]));
        return [];
      } else {
        throw error;
      }
    }
  }

  async get(id) {
    const accounts = await this.getAll();
    const accountIndex = accounts.findIndex(item => item.id === id);
    if (accountIndex === -1) {
      return null;
    }
    return accounts[accountIndex];
  }

  async update(id, data) {
    const accounts = await this.getAll();

    const accountIndex = accounts.findIndex(item => item.id === id);
    if (accountIndex === -1) {
      throw new Error(`Account with ID ${id} not found`);
    }

    accounts[accountIndex] = data;

    await fs.writeFile(this.#filePath + '/socialAccounts.json', JSON.stringify(accounts), {encoding: 'utf8'});

    return accounts[accountIndex];
  }

  async add(data) {
    const accounts = await this.getAll();
    accounts.push(data);
    await fs.writeFile(this.#filePath + '/socialAccounts.json', JSON.stringify(accounts), {encoding: 'utf8'});
    return data;
  }

  async remove(id) {
    const accounts = await this.getAll();
    accounts.splice(accounts.findIndex(account => account.id === id), 1);
    await fs.writeFile(this.#filePath + '/socialAccounts.json', JSON.stringify(accounts), {encoding: 'utf8'});
  }

  /**
   * @deprecated
   * Should the SocialsAgent service know about Telegram Bot?
   */
  async getByTelegramId(id) {
      const storageFilePath = this.#filePath + '/telegramUsers.json';
      const usersData = JSON.parse(await fs.readFile(storageFilePath, {encoding: 'utf8'}));
      const userData = usersData.users.find(user => user.username === id);
      return userData.social_agent_accounts;
  }

}

export default AccountStorage;