import fs from 'fs/promises'

class TelegramBotStorage {

  settingsExport = [{
  }]

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
    const users = JSON.parse(await fs.readFile(this.path + '/telegramUsers.json', {'encoding': 'utf8'}));
    const match = users.filter(item => item.username === username);

    return match.length !== 0 ? match[0] : false;
  }

  async addUser(id) {
    await fs.readFile(this.path + '/telegramUsers.json');
  }

  updateUser() {
  }

  removeUser() {
  }

}

export default TelegramBotStorage;
