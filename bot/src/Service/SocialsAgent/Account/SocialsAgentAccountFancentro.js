import SocialsAgentAccountBase from "./SocialsAgentAccountBase.js";
import EventEmitter from "node:events";

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
  dialogs = null;

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
          } else if (dolphinProfile.running === true && dolphinProfile.wsEndpoint !== null) {
            return await (await (await dolphinProfile.openBrowser()).openTab('fancentro')).getAuthorizationStatus(this.platformSettings.username);
          }

          return true;
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

          dolphinDialogsEvent.on('messages_data', (data) => {
            if (this.dialogs === null) {
              this.dialogs = [];
            }

            for (const receivedDialog of data) {
              const existDialogIndex = this.dialogs.findIndex((item) => item.id === receivedDialog.id);

              if (existDialogIndex !== -1) {
                this.dialogs[existDialogIndex].timestamp = receivedDialog.timestamp;
                this.dialogs[existDialogIndex].lastMessage = receivedDialog.message;
              } else {
                this.dialogs.push({
                  id: receivedDialog.id,
                  timestamp: receivedDialog.timestamp,
                  userId: receivedDialog.userId,
                  userExternalId: receivedDialog.userExternalId,
                  lastMessage: receivedDialog.message,
                });
              }
            }

            dialogsEvent.emit('update', this.dialogs);
          });

          dolphinDialogsEvent.on('users_data', (data) => {
            if (this.dialogs === null) {
              this.dialogs = [];
            }

            for (const receivedUserExternalId in data) {
              const existDialogIndex = this.dialogs.findIndex(item => +item.userExternalId === +receivedUserExternalId);
              if (existDialogIndex === -1) {
                continue;
              }

              const receivedUserData = data[receivedUserExternalId];

              this.dialogs[existDialogIndex].userName = receivedUserData.name;
            }

            dialogsEvent.emit('update', this.dialogs);
          });

          dolphinDialogsEvent.emit('refresh');
        } catch (error) {
          console.log(error);
        }

        return this.platformDialogsListener = dialogsEvent;
    }
  }

  getPlatformDialogs() {
    return this.dialogs;
  }

}

export default SocialsAgentAccountFancentro;