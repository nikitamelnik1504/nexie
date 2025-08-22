import CommandBase from "../../CommandBase.js";
import {Markup} from "telegraf";
import AccountsScene from "./AccountsScene.js";

class StartAccountCallback extends CommandBase {

  static command = /start_account_([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/;

  async run() {
    await this.context.reply('Starting account...', Markup.removeKeyboard());

    const socialsAgentAccountId = this.context.match[1];
    const socialsAgentService = await this.service.getSocialsAgentService();

    try {
      await socialsAgentService.startMessenger(socialsAgentAccountId);

      await new Promise((resolve, reject) => {
        const maxTimeout = setTimeout(() => {
          clearInterval(interval);
          reject(new Error('Account did not start in time'));
        }, 30000);

        const interval = setInterval(async () => {
          try {
            const socialsAgentAccount = await socialsAgentService.getAccount(socialsAgentAccountId);

            if (socialsAgentAccount.running) {
              clearTimeout(maxTimeout);
              clearInterval(interval);
              resolve();
            }
          } catch (err) {
            clearTimeout(maxTimeout);
            clearInterval(interval);
            reject(err);
          }
        }, 1000);
      });

      await this.context.reply('Account has been successfully started.');
    } catch (error) {
      console.error(error);
      await this.context.reply('Error happened while starting account.');
    }

    AccountsScene.refreshCommand(this.service, this.context);
  }

}

export default StartAccountCallback;