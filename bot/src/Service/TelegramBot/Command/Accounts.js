import TelegramBotCommandBase from "../TelegramBotCommandBase.js";
import {Markup} from "telegraf";

class Accounts extends TelegramBotCommandBase {

  static command = 'Accounts';

  async run() {
    await this.context.reply('Please wait a few minutes...');

    const socialsAgentService = await this.service.getSocialsAgentService();

    const messages = [];

    for (const socialAgent of socialsAgentService.getAccounts()) {
      const message = {text: null, keyboard: null};

      const agentPlatformConnectionStatus = await socialAgent.getPlatformConnectionStatus();

      const accountInfo = {
        'Account': '',
        'Client': socialAgent.getClientType(),
        'Client Connection Status': await socialAgent.getClientConnectionStatus() ? 'Connected' : 'Not Connected',
        'Platform': socialAgent.getPlatformType(),
        'Platform Connection Status': socialAgent.PLATFORM_CONNECTION_STATUS[agentPlatformConnectionStatus],
        'Login': socialAgent.getPlatformLogin(),
        'Password': socialAgent.getPlatformPassword(),
        'Access Granted To': '',
      };

      let accountInfoString = "";
      for (const [key, value] of Object.entries(accountInfo)) {
        accountInfoString += `${key}: ${value}\n`;
      }

      message.text = accountInfoString;

      switch (agentPlatformConnectionStatus) {
        case 0:
          message.keyboard = Markup.inlineKeyboard(
            [Markup.button.callback('Remove Account', 'remove_account_' + socialAgent.id)],
          );
          break;
        case 1:
          message.keyboard = Markup.inlineKeyboard(
            [Markup.button.callback('Remove Account', 'remove_account_' + socialAgent.id)],
          );
          break;
        case 2:
          message.keyboard = Markup.inlineKeyboard(
            [Markup.button.callback('Remove Account', 'remove_account_' + socialAgent.id)],
          );
          break;
        case 3:
          message.keyboard = Markup.inlineKeyboard(
            [
              Markup.button.callback('Remove Account', 'remove_account_' + socialAgent.id),
              Markup.button.callback('Start Profile', 'start_profile_' + socialAgent.id)
            ],
          );
          break;
        case 4:
          message.keyboard = Markup.inlineKeyboard(
            [Markup.button.callback('Remove Account', 'remove_account_' + socialAgent.id)],
          );
          break;
        case 5:
          message.keyboard = Markup.inlineKeyboard(
            [Markup.button.callback('Remove Account', 'remove_account_' + socialAgent.id)],
          );
          break;
      }

      messages.push(message);
    }

    for (const message of messages) {
      await this.context.reply(message.text, message.keyboard);
    }
  }
}

export default Accounts;