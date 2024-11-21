import {v4 as uuid} from 'uuid';
import SocialsAgentAccountFancentro from "./Account/SocialsAgentAccountFancentro.js";

class SocialsAgentFactory {

  service;

  constructor(service) {
    this.service = service;
  }

  createAccount(data) {
    if (data.id === undefined || data.id === '' || data.id === null) {
      data.id = uuid();
    }

    switch (data.platform.name) {
      case 'fancentro':
        return new SocialsAgentAccountFancentro(this.service, data);
    }
  }

}

export default SocialsAgentFactory;