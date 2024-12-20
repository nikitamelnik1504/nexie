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

  async getPlatformMessagesListener(dialogId) {
    if (this.dialogs === null) {
      throw new Error('Dialogs is not loaded.');
    }

    const matchedDialog = this.dialogs.find(dialog => dialog.id === dialogId);
    if (!matchedDialog) {
      throw new Error('Dialog is not found');
    }

    switch (this.clientSettings.type) {
      case 'dolphin':
        try {
          const dolphinCommunicator = await this.service.getDolphinService().connect(this.clientSettings.params.apiUrl, this.clientSettings.params.authToken);
          const dolphinProfile = await dolphinCommunicator.profile(this.clientSettings.params.profile);
          const dolphinMessagesEvent = await (await (await dolphinProfile.openBrowser()).openTab('fancentro')).getDialogMessagesLive(matchedDialog.userName);

          class MessagesList extends EventEmitter {
          }

          const messagesEvent = new MessagesList();

          dolphinMessagesEvent.removeAllListeners('messages_data');
          dolphinMessagesEvent.on('messages_data', (messages) => {
            for (const receivedMessage of messages) {
              if (matchedDialog.messages.find(message => message.id === receivedMessage.id)) {
                continue;
              }

              matchedDialog.messages.push(receivedMessage);
            }

            messagesEvent.emit('update', this.dialogs);
          })
          return messagesEvent;
        } catch (error) {
        }
    }
  }

  getPlatformDialogs() {
    if (this.dialogs === null) {
      throw new Error('Dialogs is not loaded.');
    }

    return this.dialogs;
  }

  getPlatformDialogMessages(dialogId) {
    const dialog = this.dialogs.find(dialog => dialog.id === dialogId);
    if (!dialog) {
      return [];
    }

    return dialog.messages;
  }

}

export default SocialsAgentAccountFancentro;