import express from 'express';
import bodyParser from 'body-parser';

class ApiService {

  app;

  static async init(port) {
    const app = express();
    app.use(bodyParser.json());
    app.listen(port);
  }

}

export default ApiService;
