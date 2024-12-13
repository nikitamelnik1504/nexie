import {WizardScene} from "telegraf/scenes";
import {Markup} from "telegraf";
import TelegramBotSceneBase from "../TelegramBotSceneBase.js";

class AddAccountScene extends TelegramBotSceneBase {

    static id = 'add_account';

    async scene() {
        return new WizardScene(AddAccountScene.id,
            async (context, next) => {
                await context.reply('Select client:', Markup.inlineKeyboard(
                    [
                        Markup.button.text('Dolphin Anty')
                    ]
                ));
                return next();
            },
            async (context, next) => {
                await context.reply('HEH TROL!');
            }
        );
    }

}

export default AddAccountScene;