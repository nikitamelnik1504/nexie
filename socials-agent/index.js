import {dirname} from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import SocialsAgentService from "./lib/Service.js";
import Api from "./api/index.js";

(async () => {
  const socialsAgentService = await SocialsAgentService.init(__dirname + (process.env.DATA_PATH ? process.env.DATA_PATH : '/data'));

  Api({port: process.env.EXPOSE_HTTP_API_PORT ? process.env.EXPOSE_HTTP_API_PORT : 3000, socialsAgentService});
})();

