import {v4 as uuid} from 'uuid';

class BrowserBase {

  _clientManager;

  client;

  id;

  daemons = [];

  /**
   * @todo Move _clientManager to ClientManagerCompatibleBrowser interface?
   */
  constructor(_clientManager) {
    this._clientManager = _clientManager;
    this.id = uuid();
  }

  async start() {}

  async stop() {
    if (this.daemons.length !== 0) {
      throw new Error('There are daemons exist!');
    }
  }

  async attachDaemon(daemon) {
    this.daemons.push({tabs: [], instance: daemon});
    daemon.setBrowser(this);
    return this;
  }

  async detachDaemon(daemon) {
    const index = this.daemons.findIndex(d => d.instance === daemon);

    if (index === -1) {
      throw new Error('Daemon doesn\'t exist!');
    }

    this.daemons.splice(index, 1);

    return this;
  }

  async openNewTab(daemon) {
  }

  async closeTab(daemon, tab) {
  }

}

export default BrowserBase;