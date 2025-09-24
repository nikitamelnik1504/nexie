import {Router} from "express";

export default function clientsRouter({socialsAgentService}) {
  const router = Router();

  // @todo Implement clients match in 1.0.0.
  router.get('/', (req, res) => {
    res.json(['dolphin']);
  });

  // @todo Replace profiles path with more independent data type in 1.0.0.
  // @todo Replace :type with :id in 1.0.0.
  router.get('/:type/profiles', async (req, res) => {
    const {type} = req.params;

    const client = await socialsAgentService.getClientManager().get(type, req.query);
    const clientProfiles = await client.fetchProfiles();
    res.json(clientProfiles.map(profile => {
      return {name: profile.name, id: profile.id}
    }));
  })

  return router;
}