import fs from 'fs/promises'

class Storage {

  settingsExport = [{}]

  path;

  constructor(path) {
    this.path = path;
  }

  static async init(path) {
    try {
      await fs.readFile(path + '/telegramUsers.json', {'encoding': 'utf8'});
    } catch (error) {
      await fs.writeFile(path + '/telegramUsers.json', JSON.stringify({
        users: [],
        social_agent_accounts: [],
      }), {'encoding': 'utf8'});
    }

    return new this(path);
  }

  async getUserByUsername(username) {
    const db = JSON.parse(await fs.readFile(this.path + '/telegramUsers.json', {'encoding': 'utf8'}));
    const match = db.users.filter(item => item.username === username);

    return match.length !== 0 ? match[0] : false;
  }

  async addUser(username, role) {
    if (await this.getUserByUsername(username)) {
      throw new Error('User already exists');
    }

    const db = JSON.parse(await fs.readFile(this.path + '/telegramUsers.json', {'encoding': 'utf8'}));
    db.users.push({
      username,
      role,
      social_agent_accounts: []
    });

    await fs.writeFile(this.path + '/telegramUsers.json', JSON.stringify(db), {'encoding': 'utf8'});
  }

  async updateUser(username, data = {}) {
    if (!(await this.getUserByUsername(username))) {
      throw new Error('User is not exist');
    }

    const db = JSON.parse(await fs.readFile(this.path + '/telegramUsers.json', {'encoding': 'utf8'}));
    const userIndex = db.users.findIndex(user => user.username === username);

    if (data.role !== undefined) {
      db.users[userIndex].role = data.role;
    }

    if (data.social_agent_accounts !== undefined) {
      db.users[userIndex].social_agent_accounts = data.social_agent_accounts;
    }

    await fs.writeFile(this.path + '/telegramUsers.json', JSON.stringify(db), {'encoding': 'utf8'});
  }

  async addSocialAgentAccount(id, name) {
    const db = JSON.parse(await fs.readFile(this.path + '/telegramUsers.json', {'encoding': 'utf8'}));
    if (await this.getSocialAgentAccount({id})) {
      throw new Error('Social agent account with ' + id + ' id already exist');
    }

    db.social_agent_accounts.push({
      id, name
    })

    await fs.writeFile(this.path + '/telegramUsers.json', JSON.stringify(db), {'encoding': 'utf8'});
  }

  async getSocialAgentAccount({id = undefined, name = undefined}) {
    try {
      const db = JSON.parse(await fs.readFile(this.path + '/telegramUsers.json', {encoding: 'utf8'}));
      if (!db.social_agent_accounts || !Array.isArray(db.social_agent_accounts)) {
        throw new Error('Invalid database structure: social_agent_accounts must be an array');
      }
      if (id !== undefined) {
        return db.social_agent_accounts.find(item => item.id === id) || null;
      }
      if (name !== undefined) {
        return db.social_agent_accounts.find(item => item.name === name) || null;
      }
      throw new Error('Either id or name must be provided to find a social agent account');
    } catch (error) {
      console.error('Error fetching social agent account:', error.message);
      return null;
    }
  }

  async removeSocialAgentAccount(id) {
    const db = JSON.parse(await fs.readFile(this.path + '/telegramUsers.json', {encoding: 'utf8'}));
    const accountIndex = db.social_agent_accounts.findIndex(account => account.id === id);
    if (accountIndex === -1) {
      throw new Error('Account not found');
    }

    db.social_agent_accounts.splice(accountIndex, 1);
    await fs.writeFile(this.path + '/telegramUsers.json', JSON.stringify(db), {'encoding': 'utf8'});
  }

  async setUserAccessToSocialAgentAccount(username, socialAgentAccountId) {
    const user = await this.getUserByUsername(username);
    return await this.updateUser(username, {social_agent_accounts: [...user.social_agent_accounts, socialAgentAccountId]})
  }

  async removeUserAccessToSocialAgentAccount(username, socialAgentAccountId) {
    const user = await this.getUserByUsername(username);
    return await this.updateUser(username, {social_agent_accounts: user.social_agent_accounts.filter(id => id !== socialAgentAccountId)})
  }

  async getAllUsersWithAccessToSocialAgentAccount(socialAgentAccountId) {
    const db = JSON.parse(await fs.readFile(this.path + '/telegramUsers.json', {encoding: 'utf8'}));
    return db.users.filter(user =>
      user.social_agent_accounts && user.social_agent_accounts.some(id => id === socialAgentAccountId)
    );
  }


  removeUser() {

  }

}

export default Storage;
