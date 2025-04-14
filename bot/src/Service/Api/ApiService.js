import {telegramBotService, socialsAgentService} from "../../../index.js";
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import {WebSocketServer} from "ws";
import Connection from "./WS/Connection.js";

class ApiService {

  static async init(port) {
    const app = express();
    app.use(bodyParser.json());
    app.use(cors());

    const wsServer = new WebSocketServer({
      noServer: true
    });

    const server = app.listen(port);

    server.on('upgrade', (request, socket, head) => {
      wsServer.handleUpgrade(request, socket, head, (wsClient) => {
        Connection.run(wsClient, request, telegramBotService, socialsAgentService);
      });
    });
  }

}

export default ApiService;
