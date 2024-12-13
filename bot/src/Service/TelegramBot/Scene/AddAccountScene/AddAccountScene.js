import {WizardScene} from "telegraf/scenes";
import {Markup} from "telegraf";
import TelegramBotSceneBase from "../../TelegramBotSceneBase.js";

class AddAccountScene extends TelegramBotSceneBase {

  static id = 'accounts_add';

  async scene() {
    return new WizardScene(AddAccountScene.id,
      async (context) => {
        await context.reply('Select client:', Markup.keyboard(
          ['Dolphin Anty']
        ));
        return context.wizard.next();
      },
      async (context) => {
        await context.reply('It works!');
      }
    );
  }

}

export default AddAccountScene;