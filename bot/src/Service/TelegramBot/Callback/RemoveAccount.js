import TelegramBotCommandBase from "../TelegramBotCommandBase.js";

class RemoveAccount extends TelegramBotCommandBase {

  static command = /remove_account_([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/;

  async run() {
    await this.context.reply('IMPLEMENT THIS');
  }

}

export default RemoveAccount;