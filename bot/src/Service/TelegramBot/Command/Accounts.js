import TelegramBotCommandBase from "../TelegramBotCommandBase.js";

class Accounts extends TelegramBotCommandBase {

  async run() {
    await this.context.reply('Please wait a few minutes...');

    const socialsAgentService = await this.service.getSocialsAgentService();

    const accountsInfo = [];
    for (const socialAgent of socialsAgentService.getAccounts()) {
      accountsInfo.push({
        'Account': '',
        'Client': socialAgent.getClientType(),
        'Client Connection Status': await socialAgent.getClientConnectionStatus() ? 'Connected' : 'Not Connected',
        'Platform': socialAgent.getPlatformType(),
        'Platform Connection Status': await socialAgent.getPlatformConnectionStatus(),
        'Login': socialAgent.getPlatformLogin(),
        'Password': socialAgent.getPlatformPassword(),
        'Access Granted To': '',
      });
    }

    for (const account of accountsInfo) {
      let accountInfoString = "";
      for (const [key, value] of Object.entries(account)) {
        accountInfoString += `${key}: ${value}\n`;
      }

      await this.context.reply(accountInfoString);
    }
  }
}

export default Accounts;