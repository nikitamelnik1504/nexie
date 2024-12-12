import { socialsAgentService } from "../../../index.js";

import {Telegraf} from "telegraf";

import TelegramBotStorage from "./TelegramBotStorage.js";

import Start from "./Command/Start.js";
import Settings from "./Command/Settings.js";
import Accounts from "./Command/Accounts.js";
import StartProfile from "./Callback/StartProfile.js";
import RemoveAccount from "./Callback/RemoveAccount.js";

class TelegramBotService {

  bot;

  storage;

  socialsAgentService;

  static async init(token, storagePath) {
    const instance = new this();

    instance.socialsAgentService = socialsAgentService;

    instance.storage = await TelegramBotStorage.init(storagePath);

    instance.bot = new Telegraf(token);
    instance.bot.start(async (ctx) => new Start(instance, ctx).run());
    instance.bot.hears(Settings.command, async (ctx) => new Settings(instance, ctx).run());
    instance.bot.hears(Accounts.command, async (ctx) => new Accounts(instance, ctx).run());
    instance.bot.action(StartProfile.command, async (ctx) => new StartProfile(instance, ctx).run());
    instance.bot.action(RemoveAccount.command, async (ctx) => new RemoveAccount(instance, ctx).run());
    instance.bot.launch();

    return instance;
  }

  getStorage() {
    return this.storage;
  }

  async getSocialsAgentService() {
    return this.socialsAgentService;
  }

}

export default TelegramBotService;