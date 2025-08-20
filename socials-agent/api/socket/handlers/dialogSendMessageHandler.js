export default async function dialogSendMessageHandler({ socket, payload, socialsAgentService, setupListener }) {
  if (!socket.userId) {
    socket.emit('error', { message: 'Not authenticated' });
    return;
  }

  try {
    const account = socialsAgentService.getAccount(payload.accountId);
    const messenger = await account.getMessenger();
    const dialog = messenger.getDialogs().dialog(payload.dialogId);
    const messages = dialog.getMessages();
    
    const newMessage = messenger.getFactory().createMessage(messages, payload.data);
    messages.addMessage(newMessage);

    const response = {
      accountId: account.id,
      dialogId: dialog.id,
      data: {
        id: newMessage.id,
        from: newMessage.from.id,
        timestamp: newMessage.timestamp,
        text: newMessage.text,
      }
    };
    socket.emit('dialogSendMessage', response);

    // Set up listener for message sent confirmation (only for this user)
    setupListener(socket.userId, messenger, 'messageSent', (data) => {
      socket.emit('dialogSendMessage', {
        accountId: account.id,
        dialogId: data._collection._dialog.id,
        data: {
          id: data.id,
          from: data.from.id,
          timestamp: data.timestamp,
          text: data.text,
        }
      });
    });
  } catch (error) {
    socket.emit('error', { message: 'Failed to send message' });
  }
}
