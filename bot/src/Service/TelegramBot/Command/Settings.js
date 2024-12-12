import TelegramBotCommandBase from "../TelegramBotCommandBase.js";
import {Markup} from "telegraf";

class Settings extends TelegramBotCommandBase {

  static command = 'Settings';

  async run() {
    const user = await this.service.getStorage().getUser(this.context.from.username);

    if (!user || user.role !== 'admin') {
      this.context.reply('You do not have permission to use this command.');
      return;
    }

    this.context.reply('Choose option:', Markup.keyboard(['Accounts']).resize());
  }

}

export default Settings;
