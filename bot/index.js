import {dirname} from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import TelegramBotService from "./src/Service/TelegramBot/TelegramBotService.js";
import SocialsAgentService from "./src/Service/SocialsAgent/SocialsAgentService.js";
import DolphinService from "./src/Service/Dolphin/DolphinService.js";
import ApiService from "./src/Service/Api/ApiService.js";

const dolphinService = new DolphinService();
const socialsAgentService = await SocialsAgentService.init(__dirname + '/data');
const telegramBotService = await TelegramBotService.init(process.env.TELEGRAM_BOT_TOKEN, __dirname + '/data');
await ApiService.init(process.env.EXPOSE_HTTP_API_PORT ? process.env.EXPOSE_HTTP_API_PORT : 3000);

export {dolphinService, socialsAgentService, telegramBotService}
