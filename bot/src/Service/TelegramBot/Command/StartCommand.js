import TelegramBotCommandBase from "../TelegramBotCommandBase.js";
import StartScene from "../Scene/StartScene/StartScene.js";

class StartCommand extends TelegramBotCommandBase {

  async run() {
    const user = await (await this.service.getStorage()).getUser(this.context.from.username);

    if (!user) {
      return this.context.reply('You do not have permission to use this command.');
    }

    if (user.role !== 'admin' && user.role !== 'default') {
      return this.context.reply('You do not have permission to use this command.');
    }

    // Markup.button.webApp('Chats', chatsUrl),
    return this.context.scene.enter(StartScene.id);
  }
}

export default StartCommand;