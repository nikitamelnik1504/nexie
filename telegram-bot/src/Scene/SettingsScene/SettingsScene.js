import SceneBase from "../../SceneBase.js";
import {BaseScene} from "telegraf/scenes";
import {Markup} from "telegraf";
import StartCommand from "../../Command/StartCommand.js";
import AccountsScene from "../AccountsScene/AccountsScene.js";

class SettingsScene extends SceneBase {

  static id = 'settings';

  async scene() {
    const scene = new BaseScene(SettingsScene.id);
    scene.enter((ctx) => SettingsScene.enterCommand(this.service, ctx));
    scene.hears('Back', (ctx) => SettingsScene.backCommand(this.service, ctx))
    scene.hears('Accounts', (ctx) => SettingsScene.accountsCommand(this.service, ctx))
    scene.on('message', (ctx) => SettingsScene.enterCommand(this.service, ctx))
    return scene;
  }

  static async enterCommand(service, context) {
    await context.reply('Choose option', Markup.keyboard(['Back', 'Accounts']).resize().oneTime());
  }

  static async backCommand(service, context) {
    await context.scene.leave();
    await (new StartCommand(service, context)).run();
  }

  static async accountsCommand(service, context) {
    await context.scene.enter(AccountsScene.id, {from: SettingsScene.id});
  }

}

export default SettingsScene;