import {dirname} from 'path';
import {fileURLToPath} from 'url';
import Service from "./src/Service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

Service.init(process.env.TELEGRAM_BOT_TOKEN, process.env.SOCIALS_AGENT_API_URL, __dirname + '/data');
