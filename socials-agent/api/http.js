import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import attachHttpRoutes from "./http/routes/index.js";

export default function initHttp({ port, socialsAgentService }) {
  const app = express();

  app.use(bodyParser.json());
  app.use(cors());
  app.use('/', attachHttpRoutes({ socialsAgentService }));

  const server = createServer(app);
  server.listen(port);

  return { app, server };
}