import {v4 as uuid} from 'uuid';
import EventEmitter from "node:events";

class DaemonBase {

  id;

  eventEmitter;

  settings;

  watchers = {};

  constructor(settings) {
    this.id = uuid();
    this.eventEmitter = new class extends EventEmitter {}();
    this.settings = settings;
  }

  async launch() {
    return this;
  }

  getEventEmitter() {
    return this.eventEmitter;
  }

  async stop() {
    this.eventEmitter = null;
    return this;
  }

}

export default DaemonBase;