import TelegramBotCommandBase from "../../TelegramBotCommandBase.js";
import {Markup} from "telegraf";

class AccountsListCommand extends TelegramBotCommandBase {

  static command = 'Accounts';

  async run() {
    await this.context.reply('Loading accounts...');
    const storage = await this.service.getStorage();
    const user = await storage.getUserByUsername(this.context.chat.username);

    const socialsAgentService = await this.service.getSocialsAgentService();

    const messages = [];

    const accounts = socialsAgentService.getAccounts();
    if (accounts.length === 0) {
      await this.context.reply('No accounts found.');
      return;
    }

    await this.context.reply('Please wait a few minutes...');
    for (const socialAgent of accounts) {
      const message = {text: null, keyboard: null};

      const accountClientConnectionStatus = await socialAgent.getClientConnectionStatus();
      const accountPlatformConnectionStatus = await socialAgent.getPlatformConnectionStatus();

      let accountInfo;
      if (user.role === 'admin') {
        let accessGrantedTo = [];
        for (const telegramUser of await storage.getAllUsersWithAccessToSocialAgentAccount(socialAgent.id)) {
          accessGrantedTo.push('@' + telegramUser.username);
        }

        accountInfo = {
          'Account': (await storage.getSocialAgentAccount({id: socialAgent.id})).name,
          'Client': socialAgent.getClientType(),
          'Client Status': !!(await socialAgent.getClient()) ? 'Connected' : 'Not Connected',
          'Client Connection Status': accountClientConnectionStatus ? socialAgent.constructor.CLIENT_CONNECTION_STATUS[accountClientConnectionStatus] : 'Account is not running',
          'Platform': socialAgent.getPlatformType(),
          'Platform Connection Status': accountPlatformConnectionStatus === null ? 'Account is not running' : socialAgent.constructor.PLATFORM_CONNECTION_STATUS[accountPlatformConnectionStatus],
          'Username': socialAgent.getPlatformUsername(),
          'Login': socialAgent.getPlatformLogin(),
          'Password': socialAgent.getPlatformPassword(),
          'Access Granted To': accessGrantedTo.toString(),
        };
      } else {
        accountInfo = {
          'Account': (await storage.getSocialAgentAccount({id: socialAgent.id})).name,
          'Client': socialAgent.getClientType(),
          'Client Status': !!(await socialAgent.getClient()) ? 'Connected' : 'Not Connected',
          'Client Connection Status': accountClientConnectionStatus ? socialAgent.constructor.CLIENT_CONNECTION_STATUS[accountClientConnectionStatus] : 'Account is not running',
          'Platform': socialAgent.getPlatformType(),
          'Platform Connection Status': accountPlatformConnectionStatus === null ? 'Account is not running' : socialAgent.constructor.PLATFORM_CONNECTION_STATUS[accountPlatformConnectionStatus],
          'Username': socialAgent.getPlatformUsername(),
        };
      }

      let accountInfoString = "";
      for (const [key, value] of Object.entries(accountInfo)) {
        accountInfoString += `${key}: ${value}\n`;
      }

      message.text = accountInfoString;

      if (user.role === 'admin') {
        switch (accountPlatformConnectionStatus) {
          case null:
            message.keyboard = Markup.inlineKeyboard(
              [
                Markup.button.callback('Remove', 'remove_account_' + socialAgent.id),
                Markup.button.callback('Start', 'start_account_' + socialAgent.id)
              ],
            );
            break;
          case 0:
            message.keyboard = Markup.inlineKeyboard(
              [Markup.button.callback('Remove', 'remove_account_' + socialAgent.id)],
            );
            break;
          case 1:
            message.keyboard = Markup.inlineKeyboard(
              [Markup.button.callback('Remove', 'remove_account_' + socialAgent.id)],
            );
            break;
          case 2:
            message.keyboard = Markup.inlineKeyboard(
              [Markup.button.callback('Remove', 'remove_account_' + socialAgent.id)],
            );
            break;
          case 3:
            message.keyboard = Markup.inlineKeyboard(
              [Markup.button.callback('Remove', 'remove_account_' + socialAgent.id)],
            );
            break;
          case 4:
            message.keyboard = Markup.inlineKeyboard(
              [Markup.button.callback('Remove', 'remove_account_' + socialAgent.id)],
            );
            break;
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