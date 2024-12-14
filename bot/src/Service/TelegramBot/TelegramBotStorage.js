import fs from 'fs/promises'

class TelegramBotStorage {

  settingsExport = [{}]

  path;

  constructor(path) {
    this.path = path;
  }

  static async init(path) {
    try {
      await fs.readFile(path + '/telegramUsers.json', {'encoding': 'utf8'});
    } catch (error) {
      await fs.writeFile(path + '/telegramUsers.json', JSON.stringify([]), {'encoding': 'utf8'});
    }

    return new this(path);
  }

  async getUser(username) {
    const db = JSON.parse(await fs.readFile(this.path + '/telegramUsers.json', {'encoding': 'utf8'}));
    const match = db.users.filter(item => item.username === username);

    return match.length !== 0 ? match[0] : false;
  }

  async addUser(id) {
    await fs.readFile(this.path + '/telegramUsers.json');
  }

  async addSocialAgentAccount(id, name) {
    const db = JSON.parse(await fs.readFile(this.path + '/telegramUsers.json', {'encoding': 'utf8'}));
    if (db.social_agent_accounts.find(item => item.id === id)) {
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

  updateUser() {
  }

  removeUser() {
  }

}

export default TelegramBotStorage;
