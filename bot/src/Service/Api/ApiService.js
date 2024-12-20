import {telegramBotService, socialsAgentService} from "../../../index.js";
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import {WebSocketServer} from "ws";
import WebSocketGet from "./HTTP/WebSocketGet.js";
import Connection from "./WS/Connection.js";

class ApiService {

  static async init(port) {
    const app = express();
    app.use(bodyParser.json());
    app.use(cors());

    const wsServer = new WebSocketServer({
      port: 3002,
    });
    wsServer.on('connection', (wsClient, request) => Connection.run(wsClient, request, telegramBotService, socialsAgentService));

    app.get('/:userId/dialogs/webSocket', async (request, response) => WebSocketGet.run(request, response, wsServer, telegramBotService, socialsAgentService))

    app.listen(port);
  }

}

export default ApiService;
