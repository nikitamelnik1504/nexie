import TelegramBotCommandBase from "../TelegramBotCommandBase.js";

class StartProfile extends TelegramBotCommandBase {

  async run() {
    await this.context.reply('IMPLEMENT THIS');
  }

}

export default StartProfile;