import TonDaemon from "../user/Daemon/Ton/TonDaemon.js";
import FancentroDaemon from "../user/Daemon/Fancentro/FancentroDaemon.js";

class BrowserDaemonFactory {

  createPuppeteerBrowserDaemon(settings) {
    switch (settings.name) {
      case 'ton':
        return new TonDaemon(settings);
      case 'fancentro':
        return new FancentroDaemon(settings);
    }
  }

}

export default BrowserDaemonFactory;