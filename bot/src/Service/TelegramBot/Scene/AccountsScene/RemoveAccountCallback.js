import TelegramBotCommandBase from "../../TelegramBotCommandBase.js";
import AccountsScene from "./AccountsScene.js";

class RemoveAccountCallback extends TelegramBotCommandBase {

  static command = /remove_account_([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/;

  async run() {
    await this.context.reply('Deleting the account...');
    const socialsAgentAccountId = this.context.match[1];
    const socialsAgentService = await this.service.getSocialsAgentService();

    try {
      await socialsAgentService.removeAccount(socialsAgentAccountId);
      await (await this.service.getStorage()).removeSocialAgentAccount(socialsAgentAccountId);
      await this.context.reply('Account has been deleted.');
    } catch (error) {
      console.log(error);
    }

    AccountsScene.refreshCommand(this.service, this.context);
  }

}

export default RemoveAccountCallback;