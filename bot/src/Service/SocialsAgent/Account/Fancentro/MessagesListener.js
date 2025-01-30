import EventEmitter from "node:events";

class MessagesListener extends EventEmitter {

  dialogs;
  tabEmitter;

  constructor(dialogs, tabEmitter) {
    super();

    this.dialogs = dialogs;
    this.tabEmitter = tabEmitter;
  }

  async messages(dialogId) {
    if (this.dialogs === null) {
      throw new Error('Dialogs are not loaded.');
    }
    const dialog = this.dialogs.find(dialog => dialog.id === dialogId);
    if (!dialog) {
      throw new Error('Dialog is not found');
    }

    this.tabEmitter.setDialogId(dialogId);
    await this.tabEmitter.getMessages();

    this.tabEmitter.on('messages', (messages) => {
      for (const receivedMessage of messages) {
        if (dialog.messages.find(message => message.id === receivedMessage.id)) {
          continue;
        }

        dialog.messages.push(receivedMessage);
      }

      this.emit('messages', dialog.messages);
    });
  }

}

export default MessagesListener;