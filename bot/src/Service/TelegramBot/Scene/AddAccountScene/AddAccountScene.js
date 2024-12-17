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
          authToken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNjdlYmIxMzY4MTg1NmVjNGUxMGVjYzBlYjQ2NTg5ZGRlY2I4ODhkMmM0NTZhNjkzODI4NTRmNjcxM2U1ZGI2NTUxOTZjMzAwM2UzMjc0ZjkiLCJpYXQiOjE3MzQ0MDUyNDkuNTY4MTc5LCJuYmYiOjE3MzQ0MDUyNDkuNTY4MTgxLCJleHAiOjE3NjU5NDEyNDkuNTU3Mzg0LCJzdWIiOiI0MDA1ODAyIiwic2NvcGVzIjpbXX0.kD6kca9KeiVOFf70LjBMMg3GlyN7MSUZYqmKdfN7-9TvS443xx7wDFtZIWsheaz7u6J2BKWgY-7FgeQ_j7uBc9WKewg34c5CKjfGT9ckQM6mzFg1R09b3ZH99Qj5B7OL4AUHyu_k74EWThNBlyJrT2vNAlxCGOV_0GTXR_aP63FLYyRxOTWwzg8P4jWsxis1kB3qX_5S5-l83vK61ixp6YtOcW6XKqAQZd66-y8YtwKnQ5FAqo3fUfWP0Occr9Q9kku4gCfJGBNsyHNiBo7iZkJNn_c7MCwr1IzYVzLFMkI9PB4kr0EPzmm-FQz7NDLnz1o7B6_8W9aHlj7IiJvQ0LvI7FfnFXX4IR-ID4ZAvhOXE37fvIcjsBA1MWA0Lm3oVtiN3BHvLP7AnFXincmDT39LL0p-CZQr8dKQpbOK7Gm6g-hmKOpZ-V0Ylo_eR6c_uOSNqOwkUyiLv8TMOqB5-GGS_eANLg-VBdzm0H404qEvzZ2M_HTIiHcfU0ZS4nqhKtSo6FdhGRrRjSUmS7i4E94VMY2vp_vbmzDLxM2xd6OKPR0oFaZpLDALD6sxAxFz2wGZGr79gm0cj04LQOarJ9KXUYFumirAZM7V9snzQOzWuMnla7lwbopJ7BG0ca49F9WmNO0yESWjKUC1sRcLtGwfGIuw9tcWdJTyVNj8uc8",
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

    if (!(await storage.getUser(userText))) {
      await storage.addUser(userText, 'default');
    }
    await storage.setUserAccessToSocialAgentAccount(userText, socialAgentAccount.id);

    return context.scene.enter(context.wizard.state.from);
  }

}

export default AddAccountScene;