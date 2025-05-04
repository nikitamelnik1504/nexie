import TelegramBotSceneBase from "../../TelegramBotSceneBase.js";
import {BaseScene} from "telegraf/scenes";
import {Markup} from "telegraf";
import AccountsScene from "../AccountsScene/AccountsScene.js";
import SettingsScene from "../SettingsScene/SettingsScene.js";

class StartScene extends TelegramBotSceneBase {

  static id = 'start';

  async scene() {
    const scene = new BaseScene(StartScene.id);
    scene.enter((ctx) => StartScene.enterCommand(this.service, ctx));
    scene.hears('Settings', (ctx) => StartScene.settingsCommand(this.service, ctx));
    scene.hears('Accounts', (ctx) => StartScene.accountsCommand(this.service, ctx));
    return scene;
  }

  static async enterCommand(service, context) {
    // @todo FIX DANGER BUG WITH UUID via username. It must be telegram user id.
    const user = await (await service.getStorage()).getUserByUsername(context.chat.username);

    if (user.role === 'admin') {
      return context.reply('Welcome!', Markup.keyboard(['Settings']).resize().oneTime());
    } else if (user.role === 'default') {
      return context.reply('Welcome!', Markup.keyboard([Markup.button.webApp('Chats', process.env.MESSENGER_APP_URL + '/' + user.username), 'Accounts']).resize().oneTime());
    }
  }

  static async settingsCommand(service, context) {
    return context.scene.enter(SettingsScene.id, {from: StartScene.id});
  }

  static async accountsCommand(service, context) {
    await context.scene.enter(AccountsScene.id, {from: StartScene.id});
  }

}

export default StartScene;
