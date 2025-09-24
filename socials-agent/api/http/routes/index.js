import {Router} from "express";
import accountsRouter from "./accounts.js";
import clientsRouter from "./clients.js";

export default function attachHttpRoutes({ socialsAgentService }) {
  const router = Router();
  router.use('/accounts', accountsRouter({ socialsAgentService }));
  router.use('/clients', clientsRouter({ socialsAgentService }));
  return router;
}