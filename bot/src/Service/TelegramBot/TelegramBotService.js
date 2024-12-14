import { socialsAgentService } from "../../../index.js";

import {Scenes, session, Telegraf} from "telegraf";

import TelegramBotStorage from "./TelegramBotStorage.js";

import StartCommand from "./Command/StartCommand.js";
import SettingsCommand from "./Command/SettingsCommand.js";

import SettingsScene from "./Scene/SettingsScene/SettingsScene.js";
import AccountsScene from "./Scene/AccountsScene/AccountsScene.js";
import AddAccountScene from "./Scene/AddAccountScene/AddAccountScene.js";

class TelegramBotService {

  bot;

  storage;

  socialsAgentService;

  static async init(token, storagePath) {
    const instance = new this();

    instance.socialsAgentService = socialsAgentService;

    instance.storage = await TelegramBotStorage.init(storagePath);

    instance.bot = new Telegraf(token);

    const stage = new Scenes.Stage([
        await new SettingsScene(instance).scene(),
        await new AccountsScene(instance).scene(),
        await new AddAccountScene(instance).scene(),
    ]);

    instance.bot.use(session());
    instance.bot.use(stage.middleware());

    instance.bot.start(async (ctx) => new StartCommand(instance, ctx).run());
    instance.bot.hears(SettingsCommand.command, async (ctx) => new SettingsCommand(instance, ctx).run());
    instance.bot.launch();

    return instance;
  }

  async getStorage() {
    return this.storage;
  }

  async getSocialsAgentService() {
    return this.socialsAgentService;
  }

}

export default TelegramBotService;