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
        return new SocialsAgentAccountFancentro(
          data.id,
          this.service,
          data.client.type,
          data.client.params,
          'fancentro',
          data.platform.login !== undefined ? data.platform.login : null,
          data.platform.password  !== undefined ? data.platform.password : null,
          data.platform.username !== undefined ? data.platform.username : null,
        );
    }
  }

}

export default SocialsAgentFactory;