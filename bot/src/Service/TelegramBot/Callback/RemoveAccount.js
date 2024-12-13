import TelegramBotCommandBase from "../TelegramBotCommandBase.js";
import Accounts from "../Command/Accounts.js";

class RemoveAccount extends TelegramBotCommandBase {

  static command = /remove_account_([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/;

  async run() {
    await this.context.reply('Deleting the account...');
    const socialsAgentAccountId = this.context.match[1];
    const socialsAgentService = await this.service.getSocialsAgentService();

    try {
      await socialsAgentService.removeAccount(socialsAgentAccountId);
      await this.context.reply('Account has been deleted.');
    } catch (error) {
    }

    try {
      await this.context.reply('Refreshing accounts...');
      await new Accounts(this.service, this.context).run();
    } catch (error) {
    }

  }

}

export default RemoveAccount;