import TelegramBotCommandBase from "../TelegramBotCommandBase.js";

class StartProfile extends TelegramBotCommandBase {

  async run() {
    const socialsAgentAccountId = this.context.match[1];
    const socialsAgentService = await this.service.getSocialsAgentService();
    const socialsAgentAccount = socialsAgentService.getAccount(socialsAgentAccountId);

    try {
      await socialsAgentAccount.startPlatformConnection();
    } catch (error) {

    }

    await this.context.reply('IMPLEMENT THIS');
  }

}

export default StartProfile;