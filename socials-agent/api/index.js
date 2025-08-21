import initHttp from './http.js';
import initSocket from './socket.js';

export default async function start({ port, socialsAgentService }) {
  const { server } = initHttp({ port, socialsAgentService });
  initSocket({ server, socialsAgentService });
}
