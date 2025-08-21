import { Router } from 'express';

export default function accountsRouter({ socialsAgentService }) {
  const router = Router();

  router.get('/', (req, res) => {
    const responseBody = [];

    for (const account of socialsAgentService.getAccounts()) {
      responseBody.push({
        id: account.id,
        client: {},
        platform: {},
        running: !!account.getMessenger(),
      });
    }

    res.json(responseBody);
  });

  return router;
}