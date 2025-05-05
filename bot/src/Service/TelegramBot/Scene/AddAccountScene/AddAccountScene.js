import {WizardScene} from "telegraf/scenes";
import {Markup} from "telegraf";
import TelegramBotSceneBase from "../../TelegramBotSceneBase.js";
import StartCommand from "../../Command/StartCommand.js";

class AddAccountScene extends TelegramBotSceneBase {

  static id = 'accounts_add';

  async scene() {
    const instance_vars = {};

    const scene = new WizardScene(AddAccountScene.id,
      async (context) => AddAccountScene.selectClientStep(this.service, context, instance_vars),
      async (context) => AddAccountScene.selectPlatformStep(this.service, context, instance_vars),
      async (context) => AddAccountScene.selectDolphinProfileStep(this.service, context, instance_vars),
      async (context) => AddAccountScene.setPlatformUsernameStep(this.service, context, instance_vars),
      async (context) => AddAccountScene.setPlatformLoginStep(this.service, context, instance_vars),
      async (context) => AddAccountScene.setPlatformPasswordStep(this.service, context, instance_vars),
      async (context) => AddAccountScene.setName(this.service, context, instance_vars),
      async (context) => AddAccountScene.setUsersToAccess(this.service, context, instance_vars),
      async (context) => AddAccountScene.finish(this.service, context, instance_vars),
    );

    scene.hears('Cancel', async (context) => AddAccountScene.cancelCommand(this.service, context, instance_vars));

    return scene;
  }

  static async cancelCommand(service, context, vars, back = false) {
    if (vars.socialAgentAccount !== undefined) {
      const socialsAgentService = await service.getSocialsAgentService();

      try {
        await socialsAgentService.removeAccount(vars.socialAgentAccount.id);
      } catch (error) {
        console.log(error);
      }
    }

    if (context.wizard.state.from !== undefined) {
      return context.scene.enter(context.wizard.state.from);
    } else {
      await context.scene.leave();
      return new StartCommand(service, context).run();
    }
  }

  // @todo Hardcoded clients.
  static async selectClientStep(service, context, vars, back = false) {
    await context.reply('Select client', Markup.keyboard(
      [['Dolphin Anty'], ['Cancel']]
    ).resize().oneTime());

    return context.wizard.next();
  }

  // @todo Hardcoded hosts.
  static async selectPlatformStep(service, context, vars, back = false) {
    await context.reply('Select social service', Markup.keyboard([
      ['Fancentro', 'Fansly', 'Ton'],
      ['Cancel'],
    ]).resize().oneTime());

    return context.wizard.next();
  }

  // @todo Hardcoded platforms and client settings.
  static async selectDolphinProfileStep(service, context, vars, back = false) {
    if (!back && (context.message.text !== 'Fancentro' && context.message.text !== 'Fansly' && context.message.text !== 'Ton')) {
      context.wizard.cursor = 1;
      return context.wizard.steps[context.wizard.cursor](context);
    }

    const socialsAgentService = await service.getSocialsAgentService();
    vars.socialAgentAccount = back ? vars.socialAgentAccount : socialsAgentService.getFactory().createAccount({
      client: {
        type: 'dolphin',
        params: {
          authToken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiODBlOGFjM2E4ZGY1NjZiZjkxYjU2MjU0NjM4NWE4NjI1NjlhMGEwMTE5OTVkZWVlZjNkMWU1YzM3ZjRjN2I1MDQ5NjFiZDA5MTgyMzkyMjIiLCJpYXQiOjE3MjcyOTI1OTcuNjExNTQ1LCJuYmYiOjE3MjcyOTI1OTcuNjExNTQ2LCJleHAiOjE3NTg4Mjg1OTcuNTk2OTYzLCJzdWIiOiIzNzUwNTE0Iiwic2NvcGVzIjpbXX0.cu3orWJhCEn2nqytQXTs7H6_7DhzlcSbZXxOTkbmkOzA_VpVRVuCrU3wtLGl-NSGhdi9yLTaE6Jo5i14NSqJTsUf3j2eWetUoHN3t-XIT_0dcHxFTUD1NvEF0JoJX6CPk05r6AOC7Dw4f10SPGVWbdVct2vJJDuvnWKdWDR8AAsvj-Uszgg8R8u80P1zh1o3OpQ5qSXsl1kHeacj4Nog1ZNKDZ6kGQ-6b1yR8bOItjW_FlIu37pfiiZNzWB6WIs_N7amRB9EAXXAl1AQxLHZHreJ0butYzn6nWIfW-2vvB5ZS8H6nDI-khpzAo4-Qomeg8qPELJmCDEoTbOdaQB-TISFATMGvAI2oYIbVDHpk0GxGGEh4RiM3A181IToypYdsxvsmSYrzgEsybekdQavuVIiVnhLcyNcZJRIfYYFj14pyk_oCwRl12yMUYylFU6q_LN7_Nj-zaEH0jAIHlRWM2gVZCCIgb_-37xgtwT6hOc_JGohhl1p_wIjW-HgJjgP-42l4JAmCcLJBKtVSS6PilGO9tPfldfqgK0Z4fHpBOgJkkpNxcqhlykf91hbU4h85eIqD1UH5bhVdr5608mN1_FC_VRqX8W_RvDskQi47_7Z0lSdj7lL6E-dZ4YJpIYfqc0BTXlXFJb0_uTSIlXFTAQFYSEs-Su7TR_ywbXFI4Y",
          apiUrl: "http://localhost:3001/v1.0",
        }
      },
      platform: {
        name: context.message.text.toLowerCase(),
      }
    })

    try {
      vars.socialAgentAccountClientProfiles = await (await vars.socialAgentAccount.getClient()).fetchProfiles();
    } catch (error) {
      console.log(error);
      await context.reply('Some error happened while loading profiles.');
      return this.cancelCommand(service, context, vars, true);
    }

    let responseKeyboard = [];
    for (const profile of vars.socialAgentAccountClientProfiles) {
      responseKeyboard.push(profile.name);
    }

    await context.reply('Select profile', Markup.keyboard([responseKeyboard, ['Cancel']]).resize().oneTime());
    return context.wizard.next();
  }

  // @todo Check which client is selected from prev step.
  static async setPlatformUsernameStep(service, context, vars, back = false) {
    if (!back) {
      const {socialAgentAccountClientProfiles, socialAgentAccount} = vars;
      const userText = context.message.text;

      const matchedProfile = socialAgentAccountClientProfiles.find(profile => profile.name === userText);

      if (!matchedProfile) {
        context.wizard.cursor = 2;
        return this.selectDolphinProfileStep(service, context, vars, true);
      }

      socialAgentAccount.setClientParams({...socialAgentAccount.getClientParams(), profile: matchedProfile.id});
      const socialsAgentService = await service.getSocialsAgentService();

      try {
        await socialsAgentService.validateAccount(socialAgentAccount);
      } catch (error) {
        console.log(error);
        await context.reply('Error! ' + error.message);
        context.wizard.cursor = 2;
        return this.selectDolphinProfileStep(service, context, vars, true);
      }
    }

    await context.reply("Write account username\n\nWarning! Please write it carefully, it will be used to check authorization.", Markup.keyboard(['Cancel']).resize().oneTime());
    return context.wizard.next();
  }

  static async setPlatformLoginStep(service, context, vars, back = false) {
    if (!back) {
      const {socialAgentAccount} = vars;
      const userText = context.message.text;

      socialAgentAccount.setPlatformUsername(userText);
      const socialsAgentService = await service.getSocialsAgentService();
      try {
        await socialsAgentService.validateAccount(socialAgentAccount);
      } catch (error) {
        console.log(error);
        await context.reply('Error! ' + error.message);
        context.wizard.cursor = 3;
        return this.setPlatformUsernameStep(service, context, vars, true);
      }
    }

    await context.reply('Write account login. It could be email, phone or username. Please skip this step if you prefer to pass authorization out of bot.', Markup.keyboard([['Skip'], ['Cancel']]).resize().oneTime());
    return context.wizard.next();
  }

  static async setPlatformPasswordStep(service, context, vars, back = false) {
    if (!back) {
      const userText = context.message.text;
      if (userText === 'Skip') {
        context.wizard.cursor = 6;
        return this.setName(service, context, vars, true);
      }

      const {socialAgentAccount} = vars;
      socialAgentAccount.setPlatformLogin(userText);
      const socialsAgentService = await service.getSocialsAgentService();
      try {
        await socialsAgentService.validateAccount(socialAgentAccount);
      } catch (error) {
        console.log(error);
        await context.reply('Error! ' + error.message);
        context.wizard.cursor = 4;
        return this.setPlatformLoginStep(service, context, vars, true);
      }
    }

    await context.reply('Write account password', Markup.keyboard(['Cancel']).resize().oneTime());
    return context.wizard.next();
  }

  static async setName(service, context, vars, back = false) {
    if (!back) {
      const {socialAgentAccount} = vars;
      const userText = context.message.text;

      socialAgentAccount.setPlatformPassword(userText);
      const socialsAgentService = await service.getSocialsAgentService();
      try {
        await socialsAgentService.validateAccount(socialAgentAccount);
      } catch (error) {
        console.log(error);
        await context.reply('Error! ' + error.message);
        context.wizard.cursor = 5;
        return this.setPlatformPasswordStep(service, context, vars, true);
      }
    }

    await context.reply('Write custom name for the account, which will be used in Telegram UI.', Markup.keyboard(['Cancel']).resize().oneTime());
    return context.wizard.next();
  }

  static async setUsersToAccess(service, context, vars, back = false) {
    const storage = await service.getStorage();
    const userText = context.message.text;

    if (await storage.getSocialAgentAccount({name: userText})) {
      await context.reply('Account with that name is already exist. Please use another one.');
      context.wizard.cursor = 6;
      return this.setName(service, context, vars, true);
    }

    await context.reply('Adding account...');
    const {socialAgentAccount} = vars;
    const socialsAgentService = await service.getSocialsAgentService();

    try {
      await socialsAgentService.addAccount(socialAgentAccount);
      await storage.addSocialAgentAccount(socialAgentAccount.id, userText);
    } catch (error) {
      console.log(error);
      await context.reply('Error! ' + error.message);
      return this.cancelCommand(service, context, vars, true);
    }

    await context.reply('Write telegram username that will have access to account to chat with\n\nExample: telegramUser');
    return context.wizard.next();
  }

  static async finish(service, context, vars, back = false) {
    const storage = await service.getStorage();
    const userText = context.message.text;
    const {socialAgentAccount} = vars;

    const telegramUsernames = userText.split(',');
    for (const username of telegramUsernames) {
      if (!(await storage.getUserByUsername(username.trim()))) {
        await storage.addUser(username.trim(), 'default');
      }

      await storage.setUserAccessToSocialAgentAccount(username.trim(), socialAgentAccount.id);
    }

    return context.scene.enter(context.wizard.state.from);
  }

}

export default AddAccountScene;