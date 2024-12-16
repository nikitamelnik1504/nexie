import TelegramBotCommandBase from "../TelegramBotCommandBase.js";
import {Markup} from "telegraf";
import SettingsCommand from "./SettingsCommand.js";

class StartCommand extends TelegramBotCommandBase {

  async run() {
    const user = await (await this.service.getStorage()).getUser(this.context.from.username);

    if (!user) {
      await this.context.reply('You do not have permission to use this command.');
    } else if (user.role === 'admin') {
      await this.context.reply('Welcome!', Markup.keyboard([SettingsCommand.command]).resize());
    } else if (user.role === 'default') {
      // Markup.button.webApp('Chats', chatsUrl),
    }
  }
}

export default StartCommand;