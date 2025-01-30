import SocialsAgentAccountBase from "../SocialsAgentAccountBase.js";
import EventEmitter from "node:events";
import MessagesListener from "./MessagesListener.js";

class SocialsAgentAccountFancentro extends SocialsAgentAccountBase {

  static PLATFORM_CONNECTION_STATUS = {
    0: 'Account is not authorized',
    1: 'Account is authorized',
    2: 'Account is not authorized because another account already logged in',
    3: 'Profile is not started',
    4: 'Profile is started out of bot',
    5: 'Profile is not found'
  }

  platformDialogsListener = null;
  platformMessagesListener = null;

  async getPlatformDialogsUserId() {
    // if (await this.getPlatformConnectionStatus() !== 1) {
    //   return null;
    // }

    switch (this.clientSettings.type) {
      case 'dolphin':
        try {
          const dolphinCommunicator = await this.service.getDolphinService().connect(this.clientSettings.params.apiUrl, this.clientSettings.params.authToken);
          const dolphinProfile = await dolphinCommunicator.profile(this.clientSettings.params.profile);
          return await (await (await dolphinProfile.openBrowser()).openTab('fancentro')).getAccountUserId();
        } catch (error) {
          console.log(error);
          return false;
        }
    }
  }

  async getPlatformConnectionStatus() {
    if (await super.getPlatformConnectionStatus() === false) {
      return false;
    }

    switch (this.clientSettings.type) {
      case 'dolphin':
        try {
          const dolphinCommunicator = await this.service.getDolphinService().connect(this.clientSettings.params.apiUrl, this.clientSettings.params.authToken);
          const dolphinProfile = await dolphinCommunicator.profile(this.clientSettings.params.profile);

          if (!dolphinProfile) {
            return 5;
          }

          if (dolphinProfile.running === false) {
            return 3;
          } else if (dolphinProfile.running === true && dolphinProfile.wsEndpoint === null) {
            return 4;
          }

          return await (await (await dolphinProfile.openBrowser()).openTab('fancentro')).getAuthorizationStatus(this.platformSettings.username);
        } catch (error) {
          console.log(error);
          return false;
        }
    }
  }

  async getPlatformDialogsListener() {
    if (this.platformDialogsListener !== null) {
      return this.platformDialogsListener;
    }

    switch (this.clientSettings.type) {
      case 'dolphin':
        let dialogsEvent;

        try {
          const dolphinCommunicator = await this.service.getDolphinService().connect(this.clientSettings.params.apiUrl, this.clientSettings.params.authToken);
          const dolphinProfile = await dolphinCommunicator.profile(this.clientSettings.params.profile);
          const dolphinDialogsEvent = await (await (await dolphinProfile.openBrowser()).openTab('fancentro')).getDialogsLive();

          class DialogsListEmitter extends EventEmitter {
          }

          dialogsEvent = new DialogsListEmitter();

          dolphinDialogsEvent.on('list', (data) => {
            this.dialogs = [];

            for (const receivedDialog of data) {
              this.dialogs.push({
                id: receivedDialog.id,
                timestamp: receivedDialog.timestamp,
                userId: receivedDialog.userId,
                userExternalId: receivedDialog.userExternalId,
                userName: receivedDialog.userName,
                lastMessage: receivedDialog.message,
                messages: [],
              });
            }

            dialogsEvent.emit('update');
          });

          dolphinDialogsEvent.emit('refresh');
        } catch (error) {
          console.log(error);
        }

        return this.platformDialogsListener = dialogsEvent;
    }
  }

  getPlatformDialogs() {
    if (this.dialogs === null) {
      throw new Error('Dialogs is not loaded.');
    }

    return this.dialogs;
  }

  async getPlatformMessagesListener() {
    return !this.platformMessagesListener ? this.platformMessagesListener = await (async () => {
      switch (this.clientSettings.type) {
        case 'dolphin':
          const dolphinCommunicator = await this.service.getDolphinService().connect(this.clientSettings.params.apiUrl, this.clientSettings.params.authToken);
          const dolphinProfile = await dolphinCommunicator.profile(this.clientSettings.params.profile);
          return new MessagesListener(this.dialogs, await (await (await dolphinProfile.openBrowser()).openTab('fancentro')).getDialogMessagesLive());
      }
    })() : this.platformMessagesListener;
  }

}

export default SocialsAgentAccountFancentro;