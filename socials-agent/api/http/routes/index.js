import {Router} from "express";
import accountsRouter from "./accounts.js";

export default function attachHttpRoutes({ socialsAgentService }) {
  const router = Router();
  router.use('/accounts', accountsRouter({ socialsAgentService }));
  return router;
}