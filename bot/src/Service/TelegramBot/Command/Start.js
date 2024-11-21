import TelegramBotCommandBase from "../TelegramBotCommandBase.js";
import {Markup} from "telegraf";

class Start extends TelegramBotCommandBase {

  async run() {
    const user = await this.service.getStorage().getUser(this.context.from.username);

    if (!user || user.role !== 'admin') {
      this.context.reply('You do not have permission to use this command.');
      return;
    }

    // Markup.button.webApp('Chats', chatsUrl),
    this.context.reply('Choose option:', Markup.keyboard(['Settings']).resize());
  }
}

export default Start;