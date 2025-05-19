import MessengerBase from "../../MessengerBase.js";
import MessengerFactory from "./MessengerFactory.js";

class Messenger extends MessengerBase {

  async start() {
    await super.start();
    this.factory = new MessengerFactory(this, this.daemon.getEventEmitter());

    this.me = this.factory.createMe(this.daemon.getEventEmitter().getMe());
    this.dialogs = this.factory.createDialogsCollection();

    return this;
  }

}

export default Messenger;