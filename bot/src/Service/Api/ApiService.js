import {telegramBotService, socialsAgentService} from "../../../index.js";
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import DialogsGet from "./Get/DialogsGet.js";

class ApiService {

  static async init(port) {
    const app = express();
    app.use(bodyParser.json());
    app.use(cors());

    const dialogsGet = new DialogsGet(telegramBotService, socialsAgentService);
    app.get('/:userId/dialogs/webSocket', async (req, res) => dialogsGet.ws(req, res))

    app.listen(port);
  }

}

export default ApiService;
