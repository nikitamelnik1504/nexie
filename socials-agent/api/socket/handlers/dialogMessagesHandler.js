export default async function dialogMessagesHandler({ socket, payload, socialsAgentService, setupListener }) {
  if (!socket.userId) {
    socket.emit('error', { message: 'Not authenticated' });
    return;
  }

  try {
    const account = socialsAgentService.getAccount(payload.data.accountId);
    const messenger = await account.getMessenger();
    const dialog = messenger.getDialogs().dialog(payload.data.dialogId);
    const dialogSynced = dialog.getMessages().synced;
    const messages = dialog.getMessages().list();

    const dialogMessagesListener = (data) => {
      const response = {
        accountId: account.id,
        dialogId: data[0]._collection._dialog.id,
        data: data.map(message => ({
          id: message.id,
          from: message.from.id,
          timestamp: message.timestamp,
          text: message.text,
          attachments: message.attachments.map(att => ({
            type: 'image',
            id: att.id,
            src: att.getMedia().src,
          })),
          isRead: message.isRead,
          charge: message.price
        }))
      };
      socket.emit('dialogMessages', response);
    };

    if (dialogSynced === true) {
      dialogMessagesListener(messages);
    } else {
      // Set up listener for new messages (only for this user, once)
      setupListener(`user_${socket.userId}_${socket.id}`, messenger, 'messagesList', dialogMessagesListener, true);
    }

    // Set up listener for new message notifications (only for this user)
    setupListener(socket.userId, messenger, 'messageNew', (message) => {
      socket.emit('messageNew', {
        accountId: account.id,
        dialogId: message._collection._dialog.id,
        data: {
          id: message.id,
          from: message.from.id,
          timestamp: message.timestamp,
          text: message.text,
        }
      });
    });
  } catch (error) {
    socket.emit('error', { message: 'Failed to get messages' });
  }
}
