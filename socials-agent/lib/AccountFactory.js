import {v4 as uuid} from 'uuid';
import FancentroAccount from "../src/Account/Fancentro/FancentroAccount.js";
import TonAccount from "../src/Account/Ton/TonAccount.js";

class AccountFactory {

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
        return new FancentroAccount(
          data.id,
          this.service,
          data.client.type,
          data.client.params,
          'fancentro',
          data.platform.login !== undefined ? data.platform.login : null,
          data.platform.password !== undefined ? data.platform.password : null,
          data.platform.username !== undefined ? data.platform.username : null,
        );
      case 'ton':
        return new TonAccount(
          data.id,
          this.service,
          data.client.type,
          data.client.params,
          'ton',
          data.platform.login !== undefined ? data.platform.login : null,
          data.platform.password !== undefined ? data.platform.password : null,
          data.platform.username !== undefined ? data.platform.username : null,
        );
    }
  }

}

export default AccountFactory;