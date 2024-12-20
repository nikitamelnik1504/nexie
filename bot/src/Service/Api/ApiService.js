import {telegramBotService, socialsAgentService} from "../../../index.js";
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import DialogsGet from "./Get/DialogsGet.js";
import {WebSocketServer} from "ws";

class ApiService {

  static async init(port) {
    const app = express();
    app.use(bodyParser.json());
    app.use(cors());

    const wsServer = new WebSocketServer({
      port: 3002,
    });

    const dialogsGet = await DialogsGet.init(wsServer, telegramBotService, socialsAgentService);

    app.get('/:userId/dialogs/webSocket', async (req, res) => dialogsGet.ws(req, res))

    app.listen(port);
  }

}

export default ApiService;
