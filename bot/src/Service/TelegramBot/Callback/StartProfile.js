import TelegramBotCommandBase from "../TelegramBotCommandBase.js";
import Accounts from "../Command/Accounts.js";

class StartProfile extends TelegramBotCommandBase {

  static command = /start_profile_([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/;

  async run() {
    const socialsAgentAccountId = this.context.match[1];
    const socialsAgentService = await this.service.getSocialsAgentService();
    const socialsAgentAccount = socialsAgentService.getAccount(socialsAgentAccountId);

    try {
      this.context.reply('Starting profile...');
      await socialsAgentAccount.startPlatformConnection();
      // @todo Replace.
      await (new Promise(resolve => setTimeout(() => resolve(), 10000)));
      await this.context.reply('Profile has been successfully started.');
    } catch (error) {
    }

    try {
      await this.context.reply('Refreshing accounts...');
      await new Accounts(this.service, this.context).run();
    } catch (error) {
    }
  }

}

export default StartProfile;