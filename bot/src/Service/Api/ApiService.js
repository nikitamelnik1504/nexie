import { telegramBotService, socialsAgentService } from "../../../index.js";
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { SocketHandler } from './SocketHandler.js';

class ApiService {
  static async init(port) {
    const app = express();
    app.use(bodyParser.json());
    app.use(cors());

    const server = createServer(app);
    const io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Initialize socket handler
    const socketHandler = new SocketHandler(io, telegramBotService, socialsAgentService);

    server.listen(port);
    console.log(`API Service started on port ${port}`);
  }
}

export default ApiService;
