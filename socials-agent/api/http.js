import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createServer } from 'http';

export default function initHttp({ port }) {
  const app = express();

  app.use(bodyParser.json());
  app.use(cors());

  const server = createServer(app);
  server.listen(port);

  return { app, server };
}