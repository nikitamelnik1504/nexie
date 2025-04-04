import TelegramBotCommandBase from "../../TelegramBotCommandBase.js";
import {Markup} from "telegraf";
import AccountsScene from "./AccountsScene.js";

class StartAccountCallback extends TelegramBotCommandBase {

  static command = /start_account_([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/;

  async run() {
    await this.context.reply('Starting account...', Markup.removeKeyboard());

    const socialsAgentAccountId = this.context.match[1];
    const socialsAgentService = await this.service.getSocialsAgentService();
    const socialsAgentAccount = socialsAgentService.getAccount(socialsAgentAccountId);

    try {
      await socialsAgentAccount.startPlatformConnection();
      await this.context.reply('Account has been successfully started.');
    } catch (error) {
      console.error(error);
      await this.context.reply('Error happened while starting account.');
    }

    AccountsScene.refreshCommand(this.service, this.context);
  }

}

export default StartAccountCallback;