import CommandBase from "../../CommandBase.js";
import {Markup} from "telegraf";

class AccountsListCommand extends CommandBase {

  static command = 'Accounts';

  async run() {
    await this.context.reply('Loading accounts...');
    const storage = await this.service.getStorage();
    const user = await storage.getUserByUsername(this.context.chat.username);

    const socialsAgentService = await this.service.getSocialsAgentService();

    const messages = [];

    const accounts = await socialsAgentService.getAccounts();

    if (accounts.length === 0) {
      await this.context.reply('No accounts found.');
      return;
    }

    await this.context.reply('Please wait a few minutes...');
    for (const socialAgent of accounts) {
      const message = {text: null, keyboard: null};

      let accountInfo;
      if (user.role === 'admin') {
        let accessGrantedTo = [];
        for (const telegramUser of await storage.getAllUsersWithAccessToSocialAgentAccount(socialAgent.id)) {
          accessGrantedTo.push('@' + telegramUser.username);
        }

        accountInfo = {
          'Account': (await storage.getSocialAgentAccount({id: socialAgent.id})).name,
          'Client': socialAgent.client.type,
          'Platform': socialAgent.platform.name,
          'Connection Status': socialAgent.running ? 'Account is running' : 'Account is not running',
          'Username': socialAgent.platform.username,
          'Login': socialAgent.platform.login,
          'Password': socialAgent.platform.password,
          'Access Granted To': accessGrantedTo.toString(),
        };
      } else {
        accountInfo = {
          'Account': (await storage.getSocialAgentAccount({id: socialAgent.id})).name,
          'Client': socialAgent.client.type,
          'Platform': socialAgent.platform.name,
          'Connection Status': socialAgent.running ? 'Account is running' : 'Account is not running',
          'Username': socialAgent.platform.username,
        };
      }

      let accountInfoString = "";
      for (const [key, value] of Object.entries(accountInfo)) {
        accountInfoString += `${key}: ${value}\n`;
      }

      message.text = accountInfoString;

      if (user.role === 'admin') {
        if (socialAgent.running) {
          message.keyboard = Markup.inlineKeyboard(
            [Markup.button.callback('Remove', 'remove_account_' + socialAgent.id)],
          );
        } else {
          message.keyboard = Markup.inlineKeyboard(
            [
              Markup.button.callback('Remove', 'remove_account_' + socialAgent.id),
              Markup.button.callback('Start', 'start_account_' + socialAgent.id)
            ],
          );
        }
      }

      messages.push(message);
    }

    for (const message of messages) {
      await this.context.reply(message.text, message.keyboard);
    }
  }
}

export default AccountsListCommand;