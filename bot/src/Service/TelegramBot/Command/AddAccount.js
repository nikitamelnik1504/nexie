import TelegramBotCommandBase from "../TelegramBotCommandBase.js";
import {default as AddAccountScene} from "../Scene/AddAccountScene.js";

class AddAccount extends TelegramBotCommandBase {

    static command = 'Add Account';

    async run() {
        await this.context.scene.enter(AddAccountScene.id);
    }
}

export default AddAccount;