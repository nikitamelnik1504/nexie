import {Scenes, session, Telegraf} from "telegraf";

import Storage from "./Storage.js";

import StartCommand from "./Command/StartCommand.js";

import SettingsScene from "./Scene/SettingsScene/SettingsScene.js";
import AccountsScene from "./Scene/AccountsScene/AccountsScene.js";
import AddAccountScene from "./Scene/AddAccountScene/AddAccountScene.js";
import StartScene from "./Scene/StartScene/StartScene.js";
import SocialsAgentService from "./Service/SocialsAgentService.js";

class Service {

  bot;

  storage;

  socialsAgentService;

  static async init(token, socialsAgentApiUrl, storagePath) {
    const instance = new this();

    instance.socialsAgentService = new SocialsAgentService(socialsAgentApiUrl);

    instance.storage = await Storage.init(storagePath);

    instance.bot = new Telegraf(token);

    const stage = new Scenes.Stage([
        await new StartScene(instance).scene(),
        await new SettingsScene(instance).scene(),
        await new AccountsScene(instance).scene(),
        await new AddAccountScene(instance).scene(),
    ]);

    instance.bot.use(session());
    instance.bot.use(stage.middleware());

    instance.bot.start(async (ctx) => new StartCommand(instance, ctx).run());
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

export default Service;