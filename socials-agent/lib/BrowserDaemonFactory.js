import TonDaemon from "../src/Daemon/Ton/Daemon.js";
import FancentroDaemon from "../src/Daemon/Fancentro/FancentroDaemon.js";

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