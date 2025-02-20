import { dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = {
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    dolphinApiUrl: process.env.DOLPHIN_API_URL,
    dolphinAuthToken: process.env.DOLPHIN_AUTH_TOKEN,
    apiPort: process.env.API_PORT || 3000,
    dataPath: __dirname + '/data',
    telegramWebAppUrl: process.env.TELEGRAM_WEB_APP_URL,
};

import TelegramBotService from "./src/Service/TelegramBot/TelegramBotService.js";
import SocialsAgentService from "./src/Service/SocialsAgent/SocialsAgentService.js";
import DolphinService from "./src/Service/Dolphin/DolphinService.js";
import ApiService from "./src/Service/Api/ApiService.js";

const dolphinService = new DolphinService();
const socialsAgentService = await SocialsAgentService.init(config.dataPath);
const telegramBotService = await TelegramBotService.init(config.telegramBotToken, config.dataPath);
await ApiService.init(config.apiPort);

export { dolphinService, socialsAgentService, telegramBotService };