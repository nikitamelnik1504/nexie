import {BaseScene} from "telegraf/scenes";
import {Markup} from "telegraf";

import SceneBase from "../../SceneBase.js";
import AccountsListCommand from "./AccountsListCommand.js";
import SettingsScene from "../SettingsScene/SettingsScene.js";
import StartCommand from "../../Command/StartCommand.js";
import StartAccountCallback from "./StartAccountCallback.js";
import RemoveAccountCallback from "./RemoveAccountCallback.js";
import AddAccountScene from "../AddAccountScene/AddAccountScene.js";

class AccountsScene extends SceneBase {

  static id = 'accounts_list';

  async scene() {
    const scene = new BaseScene(AccountsScene.id);
    scene.enter((ctx) => AccountsScene.enterCommand(this.service, ctx));
    scene.hears('Back', (ctx) => AccountsScene.backCommand(this.service, ctx));
    scene.hears('Refresh', (ctx) => AccountsScene.refreshCommand(this.service, ctx))
    scene.hears('Add Account', (ctx) => AccountsScene.addAccountCommand(this.service, ctx))
    scene.action(StartAccountCallback.command, async (ctx) => AccountsScene.startProfileCallback(this.service, ctx));
    scene.action(RemoveAccountCallback.command, async (ctx) => AccountsScene.removeAccountCallback(this.service, ctx));
    return scene;
  }

  static async enterCommand(service, context) {
    await new AccountsListCommand(service, context).run();
    const user = await (await service.getStorage()).getUserByUsername(context.chat.username);

    const replyKeyboardButtonsAdmin = ['Back', 'Refresh', 'Add Account'];
    const replyKeyboardButtonsDefault = ['Back', 'Refresh'];

    await context.reply('Choose option', Markup.keyboard(user.role === 'admin' ? replyKeyboardButtonsAdmin : replyKeyboardButtonsDefault).resize().oneTime());
  }

  static async backCommand(service, context) {
    const previousScene = context.scene.state.from;

    if (previousScene === SettingsScene.id) {
      await context.scene.enter(SettingsScene.id)
    } else {
      await context.scene.leave();
      await new StartCommand(service, context).run();
    }
  }

  static async refreshCommand(service, context) {
    await AccountsScene.enterCommand(service, context);
  }

  static async addAccountCommand(service, context) {
    const user = await (await service.getStorage()).getUserByUsername(context.chat.username);
    if (user.role !== 'admin') {
      return context.reply('You are not allowed to add accounts.');
    }

    await context.scene.enter(AddAccountScene.id, {from: AccountsScene.id});
  }

  static async startProfileCallback(service, context) {
    await new StartAccountCallback(service, context).run();
  }

  static async removeAccountCallback(service, context) {
    await new RemoveAccountCallback(service, context).run();
  }

}

export default AccountsScene;