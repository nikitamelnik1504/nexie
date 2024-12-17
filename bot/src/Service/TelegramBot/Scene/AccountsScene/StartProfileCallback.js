import TelegramBotCommandBase from "../../TelegramBotCommandBase.js";
import {Markup} from "telegraf";
import AccountsScene from "./AccountsScene.js";

class StartProfileCallback extends TelegramBotCommandBase {

  static command = /start_profile_([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/;

  async run() {
    await this.context.reply('Starting profile...', Markup.removeKeyboard());

    const socialsAgentAccountId = this.context.match[1];
    const socialsAgentService = await this.service.getSocialsAgentService();
    const socialsAgentAccount = socialsAgentService.getAccount(socialsAgentAccountId);

    try {
      await socialsAgentAccount.startPlatformConnection();
      // @todo Replace.
      await (new Promise(resolve => setTimeout(() => resolve(), 10000)));
      await this.context.reply('Profile has been successfully started.');
    } catch (error) {

    }

    AccountsScene.refreshCommand(this.service, this.context);
  }

}

export default StartProfileCallback;