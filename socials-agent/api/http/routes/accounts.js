import { Router } from 'express';

export default function accountsRouter({ socialsAgentService }) {
  const router = Router();

  router.get('/', async (req, res) => {
    const responseBody = [];

    for (const account of socialsAgentService.getAccounts()) {
      responseBody.push({
        id: account.id,
        client: account.clientSettings,
        platform: account.platformSettings,
        running: !!(await account.getMessenger()),
      });
    }

    res.json(responseBody);
  });

  router.post('/', async (req, res) => {
    // @todo Factory there???
    const accountFactory = socialsAgentService.getFactory();
    const account = accountFactory.createAccount(req.body);
    await socialsAgentService.addAccount(account);

    res.json(account.toJSON());
  });

  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const account = socialsAgentService.getAccount(id);

    res.json({
      id: account.id,
      client: {},
      platform: {},
      running: !!(await account.getMessenger()),
    })
  });

  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    await socialsAgentService.removeAccount(id);
    res.sendStatus(200);
  });

  router.post('/:id/messenger/start', (req, res) => {
    const { id } = req.params;

    const account = socialsAgentService.getAccount(id);
    account.startMessenger();

    res.sendStatus(200);
  });

  router.post('/:id/messenger/stop', (req, res) => {
    const { id } = req.params;

    const account = socialsAgentService.getAccount(id);
    account.stopMessenger();

    res.sendStatus(200);
  });

  return router;
}