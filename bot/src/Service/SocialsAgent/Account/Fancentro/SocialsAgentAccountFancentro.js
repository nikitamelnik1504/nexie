import SocialsAgentAccountBase from "../SocialsAgentAccountBase.js";
import MessagesListener from "./MessagesListener.js";
import Messenger from "../../Platform/Fancentro/Messenger.js";

class SocialsAgentAccountFancentro extends SocialsAgentAccountBase {

  static PLATFORM_CONNECTION_STATUS = {
    0: 'Account is not authorized',
    1: 'Account is authorized',
    2: 'Account is not authorized because another account already logged in',
    3: 'Profile is started out of bot',
    4: 'Profile is not found'
  }

  // async getPlatformDialogsUserId() {
  //   // if (await this.getPlatformConnectionStatus() !== 1) {
  //   //   return null;
  //   // }
  //
  //   switch (this.clientSettings.type) {
  //     case 'dolphin':
  //       try {
  //         const dolphinCommunicator = await this.service.getDolphinService().connect(this.clientSettings.params.apiUrl, this.clientSettings.params.authToken);
  //         const dolphinProfile = await dolphinCommunicator.profile(this.clientSettings.params.profile);
  //         return await (await (await dolphinProfile.openBrowser()).openTab('fancentro')).getAccountUserId();
  //       } catch (error) {
  //         console.log(error);
  //         return false;
  //       }
  //   }
  // }

  async getPlatformConnectionStatus() {
    return this.platformConnectionStatus;
  }

  getPlatformDialogs() {
    if (this.dialogs === null) {
      throw new Error('Dialogs is not loaded.');
    }

    return this.dialogs;
  }

  // async getPlatformMessagesListener() {
  //   return !this.platformMessagesListener ? this.platformMessagesListener = await (async () => {
  //     switch (this.clientSettings.type) {
  //       case 'dolphin':
  //         const dolphinCommunicator = await this.service.getDolphinService().connect(this.clientSettings.params.apiUrl, this.clientSettings.params.authToken);
  //         const dolphinProfile = await dolphinCommunicator.profile(this.clientSettings.params.profile);
  //         return new MessagesListener(this.dialogs, await (await (await dolphinProfile.openBrowser()).openTab('fancentro')).getDialogMessagesLive());
  //     }
  //   })() : this.platformMessagesListener;
  // }

  async startPlatformConnection() {
    if (!(await this.getClientConnectionStatus())) {
      throw new Error('Error happened while establishing connection to the client.');
    }

    let platformTab;
    switch (this.clientSettings.type) {
      case 'dolphin':
        const dolphinProfile = await (await (await this.getClient()).profile(this.clientSettings.params.profile));

        if (!dolphinProfile) {
          this.platformConnectionStatus = 4;
          throw new Error(SocialsAgentAccountFancentro.PLATFORM_CONNECTION_STATUS[this.platformConnectionStatus]);
        }

        await dolphinProfile.start()

        if (dolphinProfile.running === false) {
          this.platformConnectionStatus = 2;
          throw new Error(SocialsAgentAccountFancentro.PLATFORM_CONNECTION_STATUS[this.platformConnectionStatus]);
        } else if (dolphinProfile.running === true && dolphinProfile.wsEndpoint === null) {
          this.platformConnectionStatus = 3;
          throw new Error(SocialsAgentAccountFancentro.PLATFORM_CONNECTION_STATUS[this.platformConnectionStatus]);
        }

        platformTab = await (await dolphinProfile.openBrowser()).openTab(this.platformSettings.name);
        break;
    }

    this.messenger = await Messenger.init(platformTab, this.platformSettings.username);
  }

}

export default SocialsAgentAccountFancentro;